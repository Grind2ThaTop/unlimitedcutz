import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RANKS, RANK_ORDER, RankId, RANK_TO_MAX_LEVEL } from '@/lib/rankConfig';
import type { Database } from '@/integrations/supabase/types';

type MemberRank = Database['public']['Enums']['member_rank'];

interface UserWithRank {
  id: string;
  email: string;
  full_name: string | null;
  member_rank: {
    current_rank: MemberRank;
    is_active: boolean;
  } | null;
}

interface RankAssignmentDialogProps {
  user: UserWithRank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    userId: string; 
    newRank: MemberRank; 
    reason: string; 
    isActive: boolean;
  }) => void;
  isLoading: boolean;
}

const RankAssignmentDialog = ({
  user,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: RankAssignmentDialogProps) => {
  // Map DB rank to RankId, handling any legacy values
  const mapToRankId = (dbRank: MemberRank | undefined): RankId => {
    if (!dbRank) return 'bronze';
    if (dbRank === 'partner') return 'diamond'; // Legacy mapping
    if (RANK_ORDER.includes(dbRank as RankId)) return dbRank as RankId;
    return 'bronze';
  };

  const currentRank = mapToRankId(user?.member_rank?.current_rank);
  const [selectedRank, setSelectedRank] = useState<RankId>(currentRank);
  const [reason, setReason] = useState('');
  const [isActive, setIsActive] = useState(user?.member_rank?.is_active ?? true);

  // Reset form when user changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && user) {
      setSelectedRank(mapToRankId(user.member_rank?.current_rank));
      setIsActive(user.member_rank?.is_active ?? true);
      setReason('');
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = () => {
    if (!user || !reason.trim()) return;
    onSubmit({
      userId: user.id,
      newRank: selectedRank as MemberRank,
      reason: reason.trim(),
      isActive,
    });
  };

  const requiresAdminApproval = selectedRank === 'platinum' || selectedRank === 'diamond';
  const rankInfo = RANKS[selectedRank];

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Rank</DialogTitle>
          <DialogDescription>
            Update rank for {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Rank */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Current Rank:</span>
            <Badge variant="outline" className={RANKS[currentRank].color}>
              {RANKS[currentRank].emoji} {RANKS[currentRank].name}
            </Badge>
          </div>

          {/* Rank Selection */}
          <div className="space-y-2">
            <Label>New Rank</Label>
            <div className="grid grid-cols-2 gap-2">
              {RANK_ORDER.map((rankId) => {
                const rank = RANKS[rankId];
                const isSelected = selectedRank === rankId;
                const needsApproval = rankId === 'platinum' || rankId === 'diamond';
                
                return (
                  <button
                    key={rankId}
                    type="button"
                    onClick={() => setSelectedRank(rankId)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{rank.emoji}</span>
                      <span className="font-medium text-sm">{rank.name}</span>
                    </div>
                    {needsApproval && (
                      <span className="text-xs text-amber-500 mt-1 block">
                        Admin approval
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Approval Warning */}
          {requiresAdminApproval && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-500">Admin Override Required</p>
                <p className="text-muted-foreground">
                  {RANKS[selectedRank].name} rank normally requires {RANKS[selectedRank].qualificationText}. 
                  Your override will be logged.
                </p>
              </div>
            </div>
          )}

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Promoted for exceptional performance, Admin override for early access..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Required for audit trail
            </p>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="active-status" className="cursor-pointer">
                Benefits Active
              </Label>
              <p className="text-xs text-muted-foreground">
                {isActive ? 'User receives all rank benefits' : 'Benefits are paused'}
              </p>
            </div>
            <Switch
              id="active-status"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Rank Benefits Preview */}
          <div className="p-3 border border-border rounded-lg space-y-2">
            <p className="text-sm font-medium">Rank Benefits Preview:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Commission Depth: Levels 1–{RANK_TO_MAX_LEVEL[selectedRank]}</li>
              <li>• Fast Start: Yes</li>
              <li>• Matching Bonus: {rankInfo.benefits.matchingDepth > 0 ? `${rankInfo.benefits.matchingDepth} levels` : 'None'}</li>
              <li>• Pool Eligibility: {rankInfo.benefits.pools.length > 0 ? rankInfo.benefits.pools.join(', ') : 'None'}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RankAssignmentDialog;
