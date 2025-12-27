import { useState, useEffect } from 'react';
import { User, Mail, Calendar, DollarSign, TrendingUp, Wallet, CreditCard, Scissors, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { RANKS, RankId } from '@/lib/rankConfig';
import type { Database } from '@/integrations/supabase/types';

type MemberRank = Database['public']['Enums']['member_rank'];
type AccountType = Database['public']['Enums']['account_type'];

interface UserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditRank: () => void;
  onViewHistory: () => void;
}

const UserDetailDialog = ({
  userId,
  open,
  onOpenChange,
  onEditRank,
  onViewHistory,
}: UserDetailDialogProps) => {
  // Fetch full user details
  const { data: userDetails, isLoading } = useQuery({
    queryKey: ['adminUserDetails', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;

      // Fetch account role
      const { data: accountRole } = await supabase
        .from('account_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch member rank
      const { data: memberRank } = await supabase
        .from('member_ranks')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch membership
      const { data: membership } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Fetch commission events
      const { data: commissions } = await supabase
        .from('commission_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Calculate earnings
      const totalEarned = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      const pendingAmount = commissions?.filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      const paidAmount = commissions?.filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      // Fetch referrer info if exists
      let referrer = null;
      if (profile.referred_by) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', profile.referred_by)
          .single();
        referrer = data;
      }

      // Count direct referrals
      const { count: directReferrals } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', userId);

      return {
        profile,
        accountRole,
        memberRank,
        membership,
        commissions: commissions || [],
        earnings: { totalEarned, pendingAmount, paidAmount },
        referrer,
        directReferrals: directReferrals || 0,
      };
    },
    enabled: !!userId && open,
  });

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!userId) return null;

  const isBarber = userDetails?.accountRole?.account_type === 'barber';
  const barberVerified = userDetails?.accountRole?.barber_verified ?? false;
  const dbRank = userDetails?.memberRank?.current_rank || 'bronze';
  const rankId: RankId = dbRank === 'partner' ? 'diamond' : (dbRank as RankId);
  const rank = RANKS[rankId] || RANKS.bronze;
  const isActive = userDetails?.memberRank?.is_active ?? true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Full profile and activity information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userDetails.profile.avatar_url || ''} />
                  <AvatarFallback className={cn(
                    "text-lg",
                    isBarber ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {getInitials(userDetails.profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                {isBarber && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                    <Scissors className="w-3 h-3 text-secondary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold">
                    {userDetails.profile.full_name || 'Unnamed User'}
                  </h3>
                  <Badge variant="outline" className={`${rank.color} border-current`}>
                    {rank.emoji} {rank.name}
                  </Badge>
                  <Badge variant={isActive ? 'default' : 'destructive'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {isBarber && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        barberVerified 
                          ? "bg-secondary text-secondary-foreground border-secondary" 
                          : "bg-amber-500/20 text-amber-500 border-amber-500/50"
                      )}
                    >
                      {barberVerified ? 'Verified Barber' : 'Pending Verification'}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{userDetails.profile.email}</p>
                <p className="text-sm text-muted-foreground">
                  Referral Code: <span className="font-mono font-medium text-foreground">{userDetails.profile.referral_code}</span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Account Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Account Type</p>
                <p className="font-medium capitalize">{userDetails.accountRole?.account_type || 'Client'}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-medium">{formatDate(userDetails.profile.created_at)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Direct Referrals</p>
                <p className="font-medium">{userDetails.directReferrals}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Personally Enrolled</p>
                <p className="font-medium">{userDetails.memberRank?.personally_enrolled_count || 0}</p>
              </div>
            </div>

            {/* Referrer */}
            {userDetails.referrer && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Referred By</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(userDetails.referrer.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userDetails.referrer.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground">{userDetails.referrer.email}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Earnings Summary */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Earnings & Payments
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Earned</span>
                  </div>
                  <p className="text-xl font-bold text-green-500">
                    {formatCurrency(userDetails.earnings.totalEarned)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-xl font-bold text-amber-500">
                    {formatCurrency(userDetails.earnings.pendingAmount)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs font-medium">Paid</span>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(userDetails.earnings.paidAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Membership Info */}
            {userDetails.membership && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Membership</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={userDetails.membership.status === 'active' ? 'default' : 'secondary'}>
                        {userDetails.membership.status}
                      </Badge>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Membership ID</p>
                      <p className="font-mono text-sm">{userDetails.membership.membership_id || 'N/A'}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Base Amount</p>
                      <p className="font-medium">{formatCurrency(userDetails.membership.base_amount)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Period End</p>
                      <p className="font-medium">{formatDate(userDetails.membership.current_period_end)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Payout Info */}
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">Payout Methods</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">CashApp</p>
                  <p className={cn("font-medium", !userDetails.profile.cashapp_username && "text-muted-foreground")}>
                    {userDetails.profile.cashapp_username ? `$${userDetails.profile.cashapp_username}` : 'Not set'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">PayPal</p>
                  <p className={cn("font-medium", !userDetails.profile.paypal_email && "text-muted-foreground")}>
                    {userDetails.profile.paypal_email || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Commissions */}
            {userDetails.commissions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Recent Commissions ({userDetails.commissions.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userDetails.commissions.slice(0, 10).map((commission) => (
                      <div 
                        key={commission.id} 
                        className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {commission.commission_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(commission.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-medium",
                            commission.status === 'paid' ? 'text-green-500' : 'text-amber-500'
                          )}>
                            {formatCurrency(commission.amount)}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {commission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onViewHistory} className="flex-1">
                View Rank History
              </Button>
              <Button onClick={onEditRank} className="flex-1">
                Edit Rank
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">User not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog;
