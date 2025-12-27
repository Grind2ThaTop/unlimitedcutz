import { useState } from 'react';
import { Search, History, Edit, ToggleLeft, ToggleRight, Scissors, Eye, DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RANKS, RankId } from '@/lib/rankConfig';
import type { Database } from '@/integrations/supabase/types';

type MemberRank = Database['public']['Enums']['member_rank'];
type AccountType = Database['public']['Enums']['account_type'];

interface UserWithRankAndEarnings {
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
  account_role?: {
    account_type: AccountType;
    barber_verified: boolean;
  } | null;
  total_earned: number;
  pending_amount: number;
  paid_amount: number;
}

interface UnifiedUserTableProps {
  users: UserWithRankAndEarnings[];
  isLoading: boolean;
  onViewUser: (userId: string) => void;
  onEditRank: (user: any) => void;
  onViewHistory: (user: any) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
}

const UnifiedUserTable = ({
  users,
  isLoading,
  onViewUser,
  onEditRank,
  onViewHistory,
  onToggleActive,
}: UnifiedUserTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<MemberRank | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRank = 
      rankFilter === 'all' || 
      user.member_rank?.current_rank === rankFilter;
    
    return matchesSearch && matchesRank;
  });

  // Calculate totals
  const totals = users.reduce((acc, user) => ({
    total_earned: acc.total_earned + user.total_earned,
    pending_amount: acc.pending_amount + user.pending_amount,
    paid_amount: acc.paid_amount + user.paid_amount,
  }), { total_earned: 0, pending_amount: 0, paid_amount: 0 });

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Members</CardTitle>
        <CardDescription>
          Click on a user to see full details. Manage ranks, payments, and activity status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(totals.total_earned)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{formatCurrency(totals.pending_amount)}</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-1">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Paid Out</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totals.paid_amount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value as MemberRank | 'all')}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Ranks</option>
            {Object.entries(RANKS).map(([key, rank]) => (
              <option key={key} value={key}>
                {rank.emoji} {rank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead className="text-right">Earned</TableHead>
                <TableHead className="text-right hidden md:table-cell">Pending</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const dbRank = user.member_rank?.current_rank || 'bronze';
                  const rankId: RankId = dbRank === 'partner' ? 'diamond' : (dbRank as RankId);
                  const rank = RANKS[rankId] || RANKS.bronze;
                  const isActive = user.member_rank?.is_active ?? true;
                  const isBarber = user.account_role?.account_type === 'barber';
                  const barberVerified = user.account_role?.barber_verified ?? false;

                  return (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewUser(user.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar_url || ''} />
                              <AvatarFallback className={cn(
                                "text-xs",
                                isBarber 
                                  ? "bg-secondary text-secondary-foreground" 
                                  : "bg-primary/10 text-primary"
                              )}>
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            {isBarber && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                                <Scissors className="w-2.5 h-2.5 text-secondary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {user.full_name || 'Unnamed User'}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium text-[10px]",
                            isBarber
                              ? "bg-secondary text-secondary-foreground border-secondary"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {isBarber ? (barberVerified ? 'Barber' : 'Pending') : 'Client'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${rank.color} border-current text-[10px]`}
                        >
                          {rank.emoji} {rank.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={user.total_earned > 0 ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
                          {formatCurrency(user.total_earned)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        {user.pending_amount > 0 ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                            {formatCurrency(user.pending_amount)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">$0</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">
                          {isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewUser(user.id)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleActive(user.id, !isActive)}
                            title={isActive ? 'Pause benefits' : 'Activate benefits'}
                          >
                            {isActive ? (
                              <ToggleRight className="w-4 h-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditRank(user)}
                            title="Edit rank"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </CardContent>
    </Card>
  );
};

export default UnifiedUserTable;
