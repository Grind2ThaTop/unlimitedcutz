import { useState } from 'react';
import { Search, History, Edit, ToggleLeft, ToggleRight, Scissors } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

interface UserWithRank {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
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
}

interface UserRankTableProps {
  users: UserWithRank[];
  isLoading: boolean;
  onEditRank: (user: UserWithRank) => void;
  onViewHistory: (user: UserWithRank) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
}

const UserRankTable = ({
  users,
  isLoading,
  onEditRank,
  onViewHistory,
  onToggleActive,
}: UserRankTableProps) => {
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

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              <TableHead>Current Rank</TableHead>
              <TableHead className="hidden md:table-cell">Enrolled</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Last Evaluated</TableHead>
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
                // Map DB rank to RankId, handling legacy values
                const dbRank = user.member_rank?.current_rank || 'bronze';
                const rankId: RankId = dbRank === 'partner' ? 'diamond' : (dbRank as RankId);
                const rank = RANKS[rankId] || RANKS.bronze;
                const isActive = user.member_rank?.is_active ?? true;

                const isBarber = user.account_role?.account_type === 'barber';
                const barberVerified = user.account_role?.barber_verified ?? false;

                return (
                  <TableRow key={user.id}>
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
                            {isBarber && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  barberVerified 
                                    ? "bg-secondary text-secondary-foreground border-secondary-foreground" 
                                    : "bg-amber-500/20 text-amber-500 border-amber-500/50"
                                )}
                              >
                                {barberVerified ? 'BARBER' : 'PENDING'}
                              </Badge>
                            )}
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
                          "font-medium",
                          isBarber
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {isBarber ? 'Barber' : 'Client'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${rank.color} border-current`}
                      >
                        {rank.emoji} {rank.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.member_rank?.personally_enrolled_count || 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDate(user.member_rank?.last_evaluated_at || null)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
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
                          onClick={() => onViewHistory(user)}
                          title="View history"
                        >
                          <History className="w-4 h-4" />
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
    </div>
  );
};

export default UserRankTable;
