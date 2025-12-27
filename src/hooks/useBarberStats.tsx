import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export const useBarberStats = () => {
  const { user } = useAuth();

  // Fetch enrolled members (clients enrolled by this barber)
  const enrolledMembersQuery = useQuery({
    queryKey: ['barber-enrolled-members', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get clients where this barber is the sponsor
      const { data, error } = await supabase
        .from('account_roles')
        .select(`
          user_id,
          account_type,
          sponsor_id
        `)
        .eq('sponsor_id', user.id)
        .eq('account_type', 'client');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch membership cuts for this barber
  const membershipCutsQuery = useQuery({
    queryKey: ['barber-membership-cuts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('membership_cuts')
        .select('*')
        .eq('barber_id', user.id)
        .order('cut_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch enrollment residual earnings
  const enrollmentResidualQuery = useQuery({
    queryKey: ['barber-enrollment-residual', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('commission_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('commission_type', 'enrollment_residual');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch pool payouts
  const poolPayoutsQuery = useQuery({
    queryKey: ['barber-pool-payouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('barber_pool_payouts')
        .select('*')
        .eq('barber_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate membership cuts count
  const membershipCuts = membershipCutsQuery.data || [];
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const monthStart = startOfMonth(now);

  const membershipCutsCount = {
    today: membershipCuts.filter(cut => new Date(cut.cut_date) >= todayStart).length,
    week: membershipCuts.filter(cut => new Date(cut.cut_date) >= weekStart).length,
    month: membershipCuts.filter(cut => new Date(cut.cut_date) >= monthStart).length,
    total: membershipCuts.length,
  };

  // Calculate enrollment residual total (monthly recurring)
  const enrolledMembersCount = enrolledMembersQuery.data?.length || 0;
  const enrollmentResidualTotal = enrolledMembersCount * 25; // $25 per enrolled member

  // Calculate pool earnings
  const poolPayouts = poolPayoutsQuery.data || [];
  const poolEarnings = poolPayouts.reduce((sum, payout) => sum + Number(payout.payout_amount), 0);

  return {
    enrolledMembers: enrolledMembersQuery.data || [],
    enrolledMembersCount,
    enrollmentResidualTotal,
    membershipCuts,
    membershipCutsCount,
    poolPayouts,
    poolEarnings,
    isLoading: enrolledMembersQuery.isLoading || membershipCutsQuery.isLoading || poolPayoutsQuery.isLoading,
  };
};
