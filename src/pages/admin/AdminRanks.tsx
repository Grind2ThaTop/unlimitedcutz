import { useState } from 'react';
import { Shield, Users, UserPlus } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserRankTable from '@/components/admin/UserRankTable';
import RankAssignmentDialog from '@/components/admin/RankAssignmentDialog';
import UserRankHistoryDialog from '@/components/admin/UserRankHistoryDialog';
import AddUserDialog from '@/components/admin/AddUserDialog';
import { useAdmin } from '@/hooks/useAdmin';
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

const AdminRanks = () => {
  const { 
    users, 
    usersLoading, 
    updateRank, 
    isUpdatingRank,
    toggleActive,
    fetchUserRankHistory,
    createUser,
    isCreatingUser,
  } = useAdmin();

  const [selectedUser, setSelectedUser] = useState<UserWithRank | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const handleEditRank = (user: UserWithRank) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleViewHistory = (user: UserWithRank) => {
    setSelectedUser(user);
    setHistoryDialogOpen(true);
  };

  const handleToggleActive = (userId: string, isActive: boolean) => {
    toggleActive({ userId, isActive });
  };

  const handleRankSubmit = (data: { 
    userId: string; 
    newRank: MemberRank; 
    reason: string;
    isActive: boolean;
  }) => {
    updateRank(data, {
      onSuccess: () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const handleCreateUser = (data: {
    email: string;
    full_name: string;
    password: string;
    account_type: 'client' | 'barber';
    initial_rank: string;
    referral_code?: string;
  }) => {
    createUser(data, {
      onSuccess: () => {
        setAddUserDialogOpen(false);
      },
    });
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Rank Management
              </h1>
              <p className="text-muted-foreground">
                Assign and manage user ranks
              </p>
            </div>
          </div>
          <Button onClick={() => setAddUserDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <p className="text-2xl font-bold mt-1">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <span className="text-sm text-muted-foreground">Partners</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {users.filter(u => u.member_rank?.current_rank === 'partner').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">💼</span>
                <span className="text-sm text-muted-foreground">Executives</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {users.filter(u => u.member_rank?.current_rank === 'executive').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {users.filter(u => u.member_rank?.is_active !== false).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>
              Click edit to assign or override ranks. Executive and Partner ranks require admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserRankTable
              users={users}
              isLoading={usersLoading}
              onEditRank={handleEditRank}
              onViewHistory={handleViewHistory}
              onToggleActive={handleToggleActive}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <RankAssignmentDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleRankSubmit}
        isLoading={isUpdatingRank}
      />

      <UserRankHistoryDialog
        user={selectedUser}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        fetchHistory={fetchUserRankHistory}
      />

      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSubmit={handleCreateUser}
        isLoading={isCreatingUser}
        users={users.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          referral_code: u.referral_code,
        }))}
      />
    </PortalLayout>
  );
};

export default AdminRanks;
