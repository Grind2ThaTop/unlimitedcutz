import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  method_details: string | null;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

export const usePayouts = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get payout requests for current user
  const payoutRequestsQuery = useQuery({
    queryKey: ['payoutRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as PayoutRequest[];
    },
    enabled: !!user?.id,
  });

  // Get available balance (pending commissions)
  const balanceQuery = useQuery({
    queryKey: ['availableBalance', user?.id],
    queryFn: async () => {
      if (!user?.id) return { available: 0, paid: 0, pending_payout: 0 };

      const { data: pendingCommissions } = await supabase
        .from('commission_events')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const { data: paidCommissions } = await supabase
        .from('commission_events')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid');

      const { data: pendingPayouts } = await supabase
        .from('payout_requests')
        .select('amount')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved']);

      const available = pendingCommissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      const paid = paidCommissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      const pending_payout = pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return { available, paid, pending_payout };
    },
    enabled: !!user?.id,
  });

  // Request payout mutation
  const requestPayoutMutation = useMutation({
    mutationFn: async ({ method, method_details, amount }: { 
      method: 'cashapp' | 'paypal'; 
      method_details?: string;
      amount?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: { method, method_details, amount },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Payout Requested',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['payoutRequests'] });
      queryClient.invalidateQueries({ queryKey: ['availableBalance'] });
    },
    onError: (error) => {
      toast({
        title: 'Payout Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get compensation settings
  const settingsQuery = useQuery({
    queryKey: ['compensationSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'compensation_settings')
        .single();

      if (error) throw error;
      return data?.value as {
        fast_start: { level_1: number; level_2: number; level_3: number };
        matrix: { per_placement: number; max_depth: number };
        matching: { level_1_percent: number; level_2_percent: number };
        minimum_payout: number;
      };
    },
  });

  const hasPendingPayout = payoutRequestsQuery.data?.some(p => p.status === 'pending') || false;

  return {
    payoutRequests: payoutRequestsQuery.data || [],
    balance: balanceQuery.data || { available: 0, paid: 0, pending_payout: 0 },
    settings: settingsQuery.data,
    hasPendingPayout,
    requestPayout: requestPayoutMutation.mutate,
    isRequestingPayout: requestPayoutMutation.isPending,
    isLoading: payoutRequestsQuery.isLoading || balanceQuery.isLoading,
  };
};
