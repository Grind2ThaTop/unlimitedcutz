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
  active_bronze_count: number;
  active_silver_count: number;
  active_gold_count: number;
  active_platinum_count: number;
  // PAM-specific fields
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

  // PAM data from DB
  const personalActiveDirects = memberRank?.personal_active_directs ?? 0;
  const pamHasSilver = memberRank?.pam_has_silver ?? false;
  const pamHasGold = memberRank?.pam_has_gold ?? false;
  const pamHasPlatinum = memberRank?.pam_has_platinum ?? false;
  const pamHasDiamond = memberRank?.pam_has_diamond ?? false;

  // Legacy downline counts (kept for backwards compat)
  const activeBronzeCount = memberRank?.active_bronze_count || 0;
  const activeSilverCount = memberRank?.active_silver_count || 0;
  const activeGoldCount = memberRank?.active_gold_count || 0;
  const activePlatinumCount = memberRank?.active_platinum_count || 0;

  // Calculate progress to next rank based on PAM requirements for barbers
  const calculateProgress = (): { current: number; required: number; percentage: number; label: string } => {
    if (!nextRank) {
      return { current: 0, required: 0, percentage: 100, label: 'Max rank reached' };
    }

    const reqs = nextRank.requirements;
    
    if (isBarber && reqs.personalActiveDirects) {
      // For barbers, show personal active directs progress
      const current = Math.min(personalActiveDirects, reqs.personalActiveDirects);
      return { 
        current, 
        required: reqs.personalActiveDirects, 
        percentage: Math.round((current / reqs.personalActiveDirects) * 100),
        label: 'Personal Active Directs'
      };
    }

    // For clients, use the legacy downline counts
    if (reqs.activePlatinum) {
      const current = Math.min(activePlatinumCount, reqs.activePlatinum);
      return { 
        current, 
        required: reqs.activePlatinum, 
        percentage: Math.round((current / reqs.activePlatinum) * 100),
        label: 'Active PLATINUM members'
      };
    }
    if (reqs.activeGold) {
      const current = Math.min(activeGoldCount, reqs.activeGold);
      return { 
        current, 
        required: reqs.activeGold, 
        percentage: Math.round((current / reqs.activeGold) * 100),
        label: 'Active GOLD members'
      };
    }
    if (reqs.activeSilver) {
      const current = Math.min(activeSilverCount, reqs.activeSilver);
      return { 
        current, 
        required: reqs.activeSilver, 
        percentage: Math.round((current / reqs.activeSilver) * 100),
        label: 'Active SILVER members'
      };
    }
    if (reqs.activeBronze) {
      const current = Math.min(activeBronzeCount, reqs.activeBronze);
      return { 
        current, 
        required: reqs.activeBronze, 
        percentage: Math.round((current / reqs.activeBronze) * 100),
        label: 'Active BRONZE members'
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
    // PAM data
    personalActiveDirects,
    pamHasSilver,
    pamHasGold,
    pamHasPlatinum,
    pamHasDiamond,
    // Legacy counts
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
