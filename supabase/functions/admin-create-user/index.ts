import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  account_type: 'client' | 'barber';
  initial_rank: string;
  referral_code?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify they're admin
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is admin
    const { data: roleData, error: roleError } = await supabaseUser
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('User is not admin:', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, full_name, password, account_type, initial_rank, referral_code } = body;

    console.log('Creating user:', { email, full_name, account_type, initial_rank, referral_code });

    // Validate required fields
    if (!email || !full_name || !password) {
      return new Response(
        JSON.stringify({ error: 'Email, full name, and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create the user with admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        referral_code: referral_code || undefined,
      },
    });

    if (createError) {
      console.error('Failed to create user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created:', newUser.user.id);

    // The handle_new_user trigger will create profile, user_roles, and account_roles
    // Now we need to:
    // 1. Update account_roles if barber
    // 2. Create/update member_ranks with initial rank

    if (account_type === 'barber') {
      // Update account_roles to barber with higher percentages
      const { error: accountError } = await supabaseAdmin
        .from('account_roles')
        .update({
          account_type: 'barber',
          matrix_percent: 5,
          matching_l1_percent: 15,
          matching_l2_percent: 10,
        })
        .eq('user_id', newUser.user.id);

      if (accountError) {
        console.error('Failed to update account role:', accountError);
      }
    }

    // Create member_ranks record with initial rank
    const { error: rankError } = await supabaseAdmin
      .from('member_ranks')
      .upsert({
        user_id: newUser.user.id,
        current_rank: initial_rank,
        is_active: true,
        rank_qualified_at: new Date().toISOString(),
        last_evaluated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (rankError) {
      console.error('Failed to create member rank:', rankError);
    }

    // Log the rank assignment
    await supabaseAdmin
      .from('rank_history')
      .insert({
        user_id: newUser.user.id,
        old_rank: null,
        new_rank: initial_rank,
        reason: 'Admin manual creation',
      });

    // Process matrix placement by calling process-new-member function
    // Find sponsor_id from referral_code if provided
    let sponsorId: string | null = null;
    if (referral_code) {
      const { data: sponsorProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('referral_code', referral_code)
        .maybeSingle();
      
      if (sponsorProfile) {
        sponsorId = sponsorProfile.id;
        console.log('Found sponsor:', sponsorId);
      }
    }

    // Call process-new-member to handle matrix placement
    console.log('Calling process-new-member for matrix placement', {
      user_id: newUser.user.id,
      sponsor_id: sponsorId,
    });

    const { data: matrixResult, error: matrixError } = await supabaseAdmin.functions.invoke(
      'process-new-member',
      {
        body: {
          user_id: newUser.user.id,
          sponsor_id: sponsorId,
        },
      }
    );

    if (matrixError) {
      console.error('Failed to process matrix placement:', matrixError);
    } else {
      console.log('Matrix placement processed successfully:', matrixResult);
    }

    console.log('User setup complete:', newUser.user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user.id, 
          email: newUser.user.email 
        } 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
