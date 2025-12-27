import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  RANKS, 
  RANK_ORDER, 
  getNextRank, 
  getMaxLevelForRank,
  BARBER_LEVEL_UNLOCKS,
  CLIENT_LEVEL_UNLOCKS,
  PLATINUM_BARBER_RATE,
  BARBER_MATRIX_PERCENT,
  type RankId, 
  type RankConfig 
} from '@/lib/rankConfig';
import { useAccountRole } from './useAccountRole';

interface MemberRank {
  id: string;
  user_id: string;
  current_rank: RankId;
  rank_qualified_at: string | null;
  last_evaluated_at: string | null;
  is_active: boolean;
  personally_enrolled_count: number;
  // Personal Downline counts (for rank qualification - 2-of-previous-rank rule)
  personal_downline_bronze_count: number;
  personal_downline_silver_count: number;
  personal_downline_gold_count: number;
  personal_downline_platinum_count: number;
  // Legacy fields (kept for backward compat)
  active_bronze_count: number;
  active_silver_count: number;
  active_gold_count: number;
  active_platinum_count: number;
  personal_active_directs: number;
  pam_has_silver: boolean;
  pam_has_gold: boolean;
  pam_has_platinum: boolean;
  pam_has_diamond: boolean;
  max_paid_level: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export const useRank = () => {
  const { user } = useAuth();
  const { isBarber, accountType } = useAccountRole();

  // Get member rank from database
  const rankQuery = useQuery({
    queryKey: ['memberRank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('member_ranks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as MemberRank | null;
    },
    enabled: !!user?.id,
  });

  // Get rank history
  const historyQuery = useQuery({
    queryKey: ['rankHistory', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('rank_history')
        .select('*')
        .eq('user_id', user.id)
        .order('changed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Determine current rank based on data
  const memberRank = rankQuery.data;
  
  // Get current rank from DB or default to bronze
  const currentRankId: RankId = (memberRank?.current_rank as RankId) || 'bronze';
  const currentRank: RankConfig = RANKS[currentRankId];
  const nextRank = getNextRank(currentRankId);
  const isActive = memberRank?.is_active ?? true;

  // Personal Downline counts (for rank qualification)
  const personalDownlineBronze = memberRank?.personal_downline_bronze_count ?? 0;
  const personalDownlineSilver = memberRank?.personal_downline_silver_count ?? 0;
  const personalDownlineGold = memberRank?.personal_downline_gold_count ?? 0;
  const personalDownlinePlatinum = memberRank?.personal_downline_platinum_count ?? 0;

  // Legacy fields (kept for backward compat)
  const personalActiveDirects = memberRank?.personal_active_directs ?? 0;
  const activeBronzeCount = memberRank?.active_bronze_count || 0;
  const activeSilverCount = memberRank?.active_silver_count || 0;
  const activeGoldCount = memberRank?.active_gold_count || 0;
  const activePlatinumCount = memberRank?.active_platinum_count || 0;

  // Calculate progress to next rank based on 2-of-previous-rank rule
  const calculateProgress = (): { current: number; required: number; percentage: number; label: string } => {
    if (!nextRank) {
      return { current: 0, required: 0, percentage: 100, label: 'Max rank reached' };
    }

    const reqs = nextRank.requirements;
    
    // Silver requires 2 Bronze in Personal Downline
    if (reqs.personalDownlineBronze) {
      const current = Math.min(personalDownlineBronze, reqs.personalDownlineBronze);
      return { 
        current, 
        required: reqs.personalDownlineBronze, 
        percentage: Math.round((current / reqs.personalDownlineBronze) * 100),
        label: 'Bronze in Personal Downline'
      };
    }
    
    // Gold requires 2 Silver in Personal Downline
    if (reqs.personalDownlineSilver) {
      const current = Math.min(personalDownlineSilver, reqs.personalDownlineSilver);
      return { 
        current, 
        required: reqs.personalDownlineSilver, 
        percentage: Math.round((current / reqs.personalDownlineSilver) * 100),
        label: 'Silver in Personal Downline'
      };
    }
    
    // Platinum requires 2 Gold in Personal Downline
    if (reqs.personalDownlineGold) {
      const current = Math.min(personalDownlineGold, reqs.personalDownlineGold);
      return { 
        current, 
        required: reqs.personalDownlineGold, 
        percentage: Math.round((current / reqs.personalDownlineGold) * 100),
        label: 'Gold in Personal Downline'
      };
    }
    
    // Diamond requires 2 Platinum in Personal Downline
    if (reqs.personalDownlinePlatinum) {
      const current = Math.min(personalDownlinePlatinum, reqs.personalDownlinePlatinum);
      return { 
        current, 
        required: reqs.personalDownlinePlatinum, 
        percentage: Math.round((current / reqs.personalDownlinePlatinum) * 100),
        label: 'Platinum in Personal Downline'
      };
    }

    return { current: 0, required: 0, percentage: 100, label: '' };
  };

  const progress = calculateProgress();

  // Get max payable matrix level based on account type
  const maxPayableLevel = isBarber 
    ? (memberRank?.max_paid_level ?? BARBER_LEVEL_UNLOCKS[currentRankId])
    : getMaxLevelForRank(accountType || 'client', currentRankId);

  // Get commission rate (7% for Platinum+ barbers)
  const commissionRate = memberRank?.commission_rate ?? (
    isBarber 
      ? (currentRankId === 'platinum' || currentRankId === 'diamond' ? PLATINUM_BARBER_RATE : BARBER_MATRIX_PERCENT)
      : 2.5
  );

  return {
    memberRank,
    currentRank,
    currentRankId,
    nextRank,
    isActive,
    // Personal Downline counts (for rank qualification)
    personalDownlineBronze,
    personalDownlineSilver,
    personalDownlineGold,
    personalDownlinePlatinum,
    // Legacy data (kept for compat)
    personalActiveDirects,
    activeBronzeCount,
    activeSilverCount,
    activeGoldCount,
    activePlatinumCount,
    progress,
    maxPayableLevel,
    commissionRate,
    rankHistory: historyQuery.data || [],
    isLoading: rankQuery.isLoading,
  };
};
