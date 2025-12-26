import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RANKS, RANK_ORDER, getNextRank, type RankId, type RankConfig } from '@/lib/rankConfig';

interface MemberRank {
  id: string;
  user_id: string;
  current_rank: RankId;
  rank_qualified_at: string | null;
  last_evaluated_at: string | null;
  is_active: boolean;
  personally_enrolled_count: number;
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

  // Get personally enrolled count (active direct referrals)
  const enrolledCountQuery = useQuery({
    queryKey: ['personallyEnrolledCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      // Count profiles that were referred by this user
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);
      
      if (error) throw error;
      return count || 0;
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
  const personallyEnrolled = enrolledCountQuery.data || 0;
  
  // Calculate current rank based on personally enrolled count if no DB record
  const calculateRankFromEnrollment = (count: number): RankId => {
    if (count >= 10) return 'influencer'; // Could be executive/partner with additional requirements
    if (count >= 5) return 'grinder';
    if (count >= 3) return 'hustla';
    return 'rookie';
  };

  const currentRankId: RankId = memberRank?.current_rank || calculateRankFromEnrollment(personallyEnrolled);
  const currentRank: RankConfig = RANKS[currentRankId];
  const nextRank = getNextRank(currentRankId);
  const isActive = memberRank?.is_active ?? true;

  // Calculate progress to next rank
  const calculateProgress = (): { current: number; required: number; percentage: number } => {
    if (!nextRank) {
      return { current: personallyEnrolled, required: personallyEnrolled, percentage: 100 };
    }

    const required = nextRank.requirements.personallyEnrolled;
    const current = Math.min(personallyEnrolled, required);
    const percentage = required > 0 ? Math.round((current / required) * 100) : 100;

    return { current, required, percentage };
  };

  const progress = calculateProgress();

  // Get additional requirements text for next rank
  const getAdditionalRequirements = (): string[] => {
    if (!nextRank) return [];
    const reqs: string[] = [];
    
    if (nextRank.requirements.teamActivity) reqs.push('Team activity (admin-defined)');
    if (nextRank.requirements.orgVolume) reqs.push('Organization volume (admin-defined)');
    if (nextRank.requirements.leadershipVolume) reqs.push('Leadership volume thresholds');
    if (nextRank.requirements.orgStability) reqs.push('Organization stability');
    if (nextRank.requirements.elitePerformance) reqs.push('Elite performance metrics');
    if (nextRank.requirements.adminApproval) reqs.push('Admin approval required');
    
    return reqs;
  };

  return {
    memberRank,
    currentRank,
    currentRankId,
    nextRank,
    isActive,
    personallyEnrolled,
    progress,
    additionalRequirements: getAdditionalRequirements(),
    rankHistory: historyQuery.data || [],
    isLoading: rankQuery.isLoading || enrolledCountQuery.isLoading,
  };
};
