import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Membership = Tables<'memberships'>;
type HouseholdMember = Tables<'household_members'>;

export const useMembership = () => {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  const membershipQuery = useQuery({
    queryKey: ['membership', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const householdQuery = useQuery({
    queryKey: ['household', membershipQuery.data?.id],
    queryFn: async () => {
      if (!membershipQuery.data?.id) return [];
      
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('membership_id', membershipQuery.data.id)
        .is('removed_at', null)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!membershipQuery.data?.id,
  });

  // Check subscription status with Stripe
  const checkSubscription = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership'] });
    },
  });

  // Create checkout session
  const createCheckout = useMutation({
    mutationFn: async (additionalMembers: number = 0) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { additionalMembers },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error('Failed to start checkout: ' + error.message);
    },
  });

  // Open customer portal
  const openCustomerPortal = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast.error('Failed to open billing portal: ' + error.message);
    },
  });

  // Add household member with Stripe
  const addHouseholdMember = useMutation({
    mutationFn: async ({ name, email }: { name: string; email?: string }) => {
      const { data, error } = await supabase.functions.invoke('add-household-member', {
        body: { name, email },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      toast.success('Household member added! Your subscription has been updated.');
    },
    onError: (error) => {
      toast.error('Failed to add member: ' + error.message);
    },
  });

  const removeHouseholdMember = useMutation({
    mutationFn: async (memberId: string) => {
      const lockUntil = new Date();
      lockUntil.setDate(lockUntil.getDate() + 30);
      
      const { error } = await supabase
        .from('household_members')
        .update({
          removed_at: new Date().toISOString(),
          slot_locked_until: lockUntil.toISOString(),
        })
        .eq('id', memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
      toast.success('Household member removed.');
    },
  });

  // Check if a member is eligible for a visit this week
  const isEligibleForVisit = (member: HouseholdMember) => {
    if (!member.last_visit) return true;
    
    const lastVisit = new Date(member.last_visit);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return lastVisit < startOfWeek;
  };

  return {
    membership: membershipQuery.data,
    householdMembers: householdQuery.data || [],
    isLoading: membershipQuery.isLoading || householdQuery.isLoading,
    addHouseholdMember,
    removeHouseholdMember,
    isEligibleForVisit,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
