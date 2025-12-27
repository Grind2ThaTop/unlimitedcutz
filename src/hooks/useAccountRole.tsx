import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { 
  CLIENT_MATRIX_PERCENT, 
  BARBER_MATRIX_PERCENT, 
  CLIENT_MATCHING, 
  BARBER_MATCHING,
  type AccountType 
} from '@/lib/rankConfig';

export interface AccountRole {
  id: string;
  user_id: string;
  account_type: AccountType;
  matrix_percent: number;
  matching_l1_percent: number;
  matching_l2_percent: number;
  matching_l3_percent: number | null;
  upgraded_at: string | null;
  created_at: string;
  updated_at: string;
  barber_verified: boolean;
  sponsor_id: string | null;
}

export const useAccountRole = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's account role
  const accountRoleQuery = useQuery({
    queryKey: ['accountRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('account_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as AccountRole | null;
    },
    enabled: !!user?.id,
  });

  // Upgrade to Barber mutation (for admin use or future upgrade flow)
  const upgradeToBarberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('account_roles')
        .update({
          account_type: 'barber',
          matrix_percent: BARBER_MATRIX_PERCENT,
          matching_l1_percent: BARBER_MATCHING.l1,
          matching_l2_percent: BARBER_MATCHING.l2,
          upgraded_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountRole'] });
      toast({
        title: 'Upgrade Successful',
        description: 'Account upgraded to Barber with 5% matrix commission.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upgrade Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Downgrade to Client mutation (for admin use)
  const downgradeToClientMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('account_roles')
        .update({
          account_type: 'client',
          matrix_percent: CLIENT_MATRIX_PERCENT,
          matching_l1_percent: CLIENT_MATCHING.l1,
          matching_l2_percent: CLIENT_MATCHING.l2,
          upgraded_at: null,
        })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountRole'] });
      toast({
        title: 'Downgrade Complete',
        description: 'Account changed to Client with 2.5% matrix commission.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Downgrade Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const accountRole = accountRoleQuery.data;
  const accountType: AccountType = accountRole?.account_type || 'client';
  const matrixPercent = accountRole?.matrix_percent || CLIENT_MATRIX_PERCENT;
  const matchingL1 = accountRole?.matching_l1_percent || CLIENT_MATCHING.l1;
  const matchingL2 = accountRole?.matching_l2_percent || CLIENT_MATCHING.l2;
  const matchingL3 = accountRole?.matching_l3_percent || (accountType === 'barber' ? BARBER_MATCHING.l3 : null);
  const isBarber = accountType === 'barber';
  const isClient = accountType === 'client';

  return {
    accountRole,
    accountType,
    matrixPercent,
    matchingL1,
    matchingL2,
    matchingL3,
    isBarber,
    isClient,
    isLoading: accountRoleQuery.isLoading,
    upgradeToBarber: upgradeToBarberMutation.mutate,
    downgradeToClient: downgradeToClientMutation.mutate,
    isUpgrading: upgradeToBarberMutation.isPending,
    isDowngrading: downgradeToClientMutation.isPending,
  };
};
