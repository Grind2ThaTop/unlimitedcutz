import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RANKS, RANK_ORDER, getNextRank, RANK_TO_MAX_LEVEL, type RankId, type RankConfig } from '@/lib/rankConfig';

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
  created_at: string;
  updated_at: string;
}

export const useRank = () => {
  const { user } = useAuth();

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

  // Get downline counts for qualification progress
  const activeBronzeCount = memberRank?.active_bronze_count || 0;
  const activeSilverCount = memberRank?.active_silver_count || 0;
  const activeGoldCount = memberRank?.active_gold_count || 0;
  const activePlatinumCount = memberRank?.active_platinum_count || 0;

  // Calculate progress to next rank based on downline requirements
  const calculateProgress = (): { current: number; required: number; percentage: number; label: string } => {
    if (!nextRank) {
      return { current: 0, required: 0, percentage: 100, label: 'Max rank reached' };
    }

    const reqs = nextRank.requirements;
    
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

  // Get max payable matrix level for this rank
  const maxPayableLevel = RANK_TO_MAX_LEVEL[currentRankId];

  return {
    memberRank,
    currentRank,
    currentRankId,
    nextRank,
    isActive,
    activeBronzeCount,
    activeSilverCount,
    activeGoldCount,
    activePlatinumCount,
    progress,
    maxPayableLevel,
    rankHistory: historyQuery.data || [],
    isLoading: rankQuery.isLoading,
  };
};
