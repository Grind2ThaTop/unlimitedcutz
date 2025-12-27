import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type MemberRank = Database['public']['Enums']['member_rank'];

interface UserWithRank {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  created_at: string;
  member_rank: {
    id: string;
    current_rank: MemberRank;
    is_active: boolean;
    personally_enrolled_count: number;
    last_evaluated_at: string | null;
    rank_qualified_at: string | null;
  } | null;
}

interface RankHistoryEntry {
  id: string;
  old_rank: MemberRank | null;
  new_rank: MemberRank;
  changed_at: string;
  reason: string | null;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const adminQuery = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch all users with their ranks (admin only)
  const usersQuery = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, referral_code, created_at')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Then get all member_ranks
      const { data: ranks, error: ranksError } = await supabase
        .from('member_ranks')
        .select('*');
      
      if (ranksError) throw ranksError;

      // Combine the data
      const usersWithRanks: UserWithRank[] = (profiles || []).map(profile => {
        const rank = ranks?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          member_rank: rank ? {
            id: rank.id,
            current_rank: rank.current_rank,
            is_active: rank.is_active,
            personally_enrolled_count: rank.personally_enrolled_count,
            last_evaluated_at: rank.last_evaluated_at,
            rank_qualified_at: rank.rank_qualified_at,
          } : null,
        };
      });

      return usersWithRanks;
    },
    enabled: adminQuery.data === true,
  });

  // Fetch rank history for a specific user
  const fetchUserRankHistory = async (userId: string): Promise<RankHistoryEntry[]> => {
    const { data, error } = await supabase
      .from('rank_history')
      .select('*')
      .eq('user_id', userId)
      .order('changed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  };

  // Update user rank mutation
  const updateRankMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      newRank, 
      reason, 
      isActive 
    }: { 
      userId: string; 
      newRank: MemberRank; 
      reason: string;
      isActive: boolean;
    }) => {
      // Get current rank first
      const { data: currentRankData } = await supabase
        .from('member_ranks')
        .select('current_rank')
        .eq('user_id', userId)
        .maybeSingle();

      const oldRank = currentRankData?.current_rank || null;

      // Upsert the member_ranks record
      const { error: upsertError } = await supabase
        .from('member_ranks')
        .upsert({
          user_id: userId,
          current_rank: newRank,
          is_active: isActive,
          rank_qualified_at: new Date().toISOString(),
          last_evaluated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) throw upsertError;

      // Log to rank_history
      const { error: historyError } = await supabase
        .from('rank_history')
        .insert({
          user_id: userId,
          old_rank: oldRank,
          new_rank: newRank,
          reason: reason,
        });

      if (historyError) throw historyError;

      return { userId, newRank };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Rank Updated',
        description: 'User rank has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update rank. ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle user active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('member_ranks')
        .update({ is_active: isActive })
        .eq('user_id', userId);

      if (error) throw error;
      return { userId, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: data.isActive ? 'User Activated' : 'User Deactivated',
        description: `User benefits have been ${data.isActive ? 'activated' : 'paused'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update status. ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Create new user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      full_name: string;
      password: string;
      account_type: 'client' | 'barber';
      initial_rank: string;
      referral_code?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: userData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'User Created',
        description: 'New user has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create user. ' + error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    isAdmin: adminQuery.data ?? false,
    isAdminLoading: adminQuery.isLoading,
    users: usersQuery.data || [],
    usersLoading: usersQuery.isLoading,
    fetchUserRankHistory,
    updateRank: updateRankMutation.mutate,
    isUpdatingRank: updateRankMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
    isTogglingActive: toggleActiveMutation.isPending,
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
  };
};
