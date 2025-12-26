import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RANKS, RankId } from '@/lib/rankConfig';
import type { Database } from '@/integrations/supabase/types';

type MemberRank = Database['public']['Enums']['member_rank'];

interface RankHistoryEntry {
  id: string;
  old_rank: MemberRank | null;
  new_rank: MemberRank;
  changed_at: string;
  reason: string | null;
}

interface UserWithRank {
  id: string;
  email: string;
  full_name: string | null;
}

interface UserRankHistoryDialogProps {
  user: UserWithRank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchHistory: (userId: string) => Promise<RankHistoryEntry[]>;
}

const UserRankHistoryDialog = ({
  user,
  open,
  onOpenChange,
  fetchHistory,
}: UserRankHistoryDialogProps) => {
  const [history, setHistory] = useState<RankHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setIsLoading(true);
      fetchHistory(user.id)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [open, user, fetchHistory]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getRankBadge = (rankId: MemberRank | null) => {
    if (!rankId) {
      return <Badge variant="outline" className="text-muted-foreground">None</Badge>;
    }
    const rank = RANKS[rankId as RankId];
    return (
      <Badge variant="outline" className={rank.color}>
        {rank.emoji} {rank.name}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rank History</DialogTitle>
          <DialogDescription>
            {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rank changes recorded
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`relative pl-6 pb-4 ${
                    index !== history.length - 1 ? 'border-l-2 border-border' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    {/* Rank change */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getRankBadge(entry.old_rank)}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      {getRankBadge(entry.new_rank)}
                    </div>
                    
                    {/* Reason */}
                    {entry.reason && (
                      <p className="text-sm text-muted-foreground">
                        "{entry.reason}"
                      </p>
                    )}
                    
                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.changed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserRankHistoryDialog;
