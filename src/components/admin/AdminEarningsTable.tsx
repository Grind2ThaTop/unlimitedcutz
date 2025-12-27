import { useState } from 'react';
import { DollarSign, Search, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserEarnings {
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  total_earned: number;
  pending_amount: number;
  paid_amount: number;
  commission_count: number;
}

const AdminEarningsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all user earnings summary
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['adminUserEarnings'],
    queryFn: async () => {
      // First get all commission events grouped by user
      const { data: commissions, error: commissionsError } = await supabase
        .from('commission_events')
        .select('user_id, amount, status');

      if (commissionsError) throw commissionsError;

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url');

      if (profilesError) throw profilesError;

      // Aggregate earnings by user
      const userEarningsMap = new Map<string, {
        total_earned: number;
        pending_amount: number;
        paid_amount: number;
        commission_count: number;
      }>();

      commissions?.forEach(c => {
        const existing = userEarningsMap.get(c.user_id) || {
          total_earned: 0,
          pending_amount: 0,
          paid_amount: 0,
          commission_count: 0
        };

        existing.total_earned += Number(c.amount);
        existing.commission_count += 1;
        
        if (c.status === 'pending') {
          existing.pending_amount += Number(c.amount);
        } else if (c.status === 'paid') {
          existing.paid_amount += Number(c.amount);
        }

        userEarningsMap.set(c.user_id, existing);
      });

      // Combine with profiles - include all users even without earnings
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const result: UserEarnings[] = profiles?.map(profile => {
        const earnings = userEarningsMap.get(profile.id);
        return {
          user_id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          total_earned: earnings?.total_earned || 0,
          pending_amount: earnings?.pending_amount || 0,
          paid_amount: earnings?.paid_amount || 0,
          commission_count: earnings?.commission_count || 0,
        };
      }) || [];

      // Sort by total earned descending
      return result.sort((a, b) => b.total_earned - a.total_earned);
    },
  });

  // Calculate totals
  const totals = earnings?.reduce((acc, user) => ({
    total_earned: acc.total_earned + user.total_earned,
    pending_amount: acc.pending_amount + user.pending_amount,
    paid_amount: acc.paid_amount + user.paid_amount,
  }), { total_earned: 0, pending_amount: 0, paid_amount: 0 }) || { total_earned: 0, pending_amount: 0, paid_amount: 0 };

  const filteredEarnings = earnings?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            User Earnings & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          User Earnings & Payments
        </CardTitle>
        <CardDescription>
          Track all user commissions, earnings, and payout status
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead className="text-right">Total Earned</TableHead>
                <TableHead className="text-right hidden md:table-cell">Pending</TableHead>
                <TableHead className="text-right hidden md:table-cell">Paid</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Commissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEarnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No earnings data yet
                  </TableCell>
                </TableRow>
              ) : (
                filteredEarnings.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {user.full_name || 'Unnamed User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={user.total_earned > 0 ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
                        {formatCurrency(user.total_earned)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      {user.pending_amount > 0 ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                          {formatCurrency(user.pending_amount)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">$0.00</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <span className="text-muted-foreground">
                        {formatCurrency(user.paid_amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <Badge variant="secondary">
                        {user.commission_count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredEarnings.length} users
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminEarningsTable;
