import PortalLayout from "@/components/portal/PortalLayout";
import { Users, Plus, Trash2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMembership } from "@/hooks/useMembership";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Household = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const { toast } = useToast();
  
  const { 
    membership,
    householdMembers, 
    isLoading,
    addHouseholdMember, 
    removeHouseholdMember,
    isEligibleForVisit,
  } = useMembership();

  const baseIncluded = 2;
  const additionalMembers = Math.max(0, householdMembers.length - baseIncluded);

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the member's name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addHouseholdMember.mutateAsync({
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || undefined,
      });
      toast({
        title: "Member added",
        description: `${newMemberName} has been added to your household.`,
      });
      setNewMemberName("");
      setNewMemberEmail("");
      setIsAddOpen(false);
    } catch (error) {
      toast({
        title: "Failed to add member",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await removeHouseholdMember.mutateAsync(memberId);
      toast({
        title: "Member removed",
        description: `${memberName} has been removed. This slot is locked for 30 days.`,
      });
    } catch (error) {
      toast({
        title: "Failed to remove member",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl mb-2">Household Members</h1>
            <p className="text-muted-foreground">
              Manage who's included in your membership
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="w-5 h-5 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Add Household Member</DialogTitle>
                <DialogDescription>
                  Adding a member will add $25/month to your subscription.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter full name" 
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddMember}
                  disabled={addHouseholdMember.isPending}
                >
                  {addHouseholdMember.isPending ? "Adding..." : "Add Member (+$25/mo)"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <div className="bg-secondary text-secondary-foreground rounded-xl p-6 mb-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Total Members</p>
              <p className="font-display text-3xl">{householdMembers.length}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Base Included</p>
              <p className="font-display text-3xl">{baseIncluded}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Additional Cost</p>
              <p className="font-display text-3xl text-primary">
                ${additionalMembers > 0 ? additionalMembers * 25 : 0}/mo
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-700">Household Rules</p>
            <p className="text-sm text-amber-600/80">
              Each person can visit once per week. Members cannot be swapped. If you remove someone, 
              that slot is locked for 30 days before a new person can be added.
            </p>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Members ({householdMembers.length})
            </h2>
          </div>

          {householdMembers.length > 0 ? (
            <div className="divide-y divide-border/50">
              {householdMembers.map((member) => {
                const eligible = isEligibleForVisit(member);
                return (
                  <div key={member.id} className="p-4 lg:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-lg text-primary">
                          {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {member.is_primary && (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email || 'No email'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          eligible 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {eligible ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Eligible
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Used This Week
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {member.last_visit ? format(new Date(member.last_visit), 'MMM d, yyyy') : 'Never'}
                        </p>
                      </div>

                      {!member.is_primary && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          disabled={removeHouseholdMember.isPending}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No household members yet</p>
              <p className="text-sm">Add yourself and your family to get started</p>
            </div>
          )}
        </div>

        {/* Add More */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Need more slots? Add additional household members for $25/month each.
          </p>
          <Button variant="dark" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Another Member
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Household;
