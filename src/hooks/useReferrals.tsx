import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useReferrals = () => {
  const { user, profile } = useAuth();

  // Get commission events for the current user
  const commissionsQuery = useQuery({
    queryKey: ['commissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('commission_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get matrix node for the current user
  const matrixNodeQuery = useQuery({
    queryKey: ['matrixNode', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('matrix_nodes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get direct referrals (people who used this user's referral code)
  const directReferralsQuery = useQuery({
    queryKey: ['directReferrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate earnings summary
  const earningsSummary = {
    fastStart: commissionsQuery.data
      ?.filter(c => c.commission_type === 'fast_start')
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    levelBonus: commissionsQuery.data
      ?.filter(c => c.commission_type === 'level_bonus')
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    matrixMembership: commissionsQuery.data
      ?.filter(c => c.commission_type === 'matrix_membership')
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0,
    productCommission: commissionsQuery.data
      ?.filter(c => c.commission_type === 'product_commission')
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0,
  };

  const totalEarnings = 
    earningsSummary.fastStart + 
    earningsSummary.levelBonus + 
    earningsSummary.matrixMembership + 
    earningsSummary.productCommission;

  const pendingEarnings = commissionsQuery.data
    ?.filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  const referralLink = profile?.referral_code 
    ? `${window.location.origin}/auth?ref=${profile.referral_code}`
    : '';

  return {
    commissions: commissionsQuery.data || [],
    matrixNode: matrixNodeQuery.data,
    directReferrals: directReferralsQuery.data || [],
    earningsSummary,
    totalEarnings,
    pendingEarnings,
    referralLink,
    referralCode: profile?.referral_code || '',
    isLoading: commissionsQuery.isLoading || matrixNodeQuery.isLoading,
  };
};
