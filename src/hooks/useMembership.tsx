import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Membership = Tables<'memberships'>;
type Connection = Tables<'connections'>;

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

  const connectionsQuery = useQuery({
    queryKey: ['connections', membershipQuery.data?.id],
    queryFn: async () => {
      if (!membershipQuery.data?.id) return [];
      
      const { data, error } = await supabase
        .from('connections')
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
    mutationFn: async (additionalConnections: number = 0) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { additionalConnections },
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

  // Add connection with Stripe
  const addConnection = useMutation({
    mutationFn: async ({ name, email }: { name: string; email?: string }) => {
      const { data, error } = await supabase.functions.invoke('add-connection', {
        body: { name, email },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      toast.success('Connection added! Your subscription has been updated.');
    },
    onError: (error) => {
      toast.error('Failed to add connection: ' + error.message);
    },
  });

  const removeConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const lockUntil = new Date();
      lockUntil.setDate(lockUntil.getDate() + 30);
      
      const { error } = await supabase
        .from('connections')
        .update({
          removed_at: new Date().toISOString(),
          slot_locked_until: lockUntil.toISOString(),
        })
        .eq('id', connectionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection removed.');
    },
  });

  // Check if a connection is eligible for a visit this week
  const isEligibleForVisit = (connection: Connection) => {
    if (!connection.last_visit) return true;
    
    const lastVisit = new Date(connection.last_visit);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return lastVisit < startOfWeek;
  };

  return {
    membership: membershipQuery.data,
    connections: connectionsQuery.data || [],
    isLoading: membershipQuery.isLoading || connectionsQuery.isLoading,
    addConnection,
    removeConnection,
    isEligibleForVisit,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
