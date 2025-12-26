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

const Household = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Mock data
  const householdMembers = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "eligible", lastVisit: "Dec 20, 2024", isPrimary: true },
    { id: 2, name: "Jane Doe", email: "jane@example.com", status: "used", lastVisit: "Dec 23, 2024", isPrimary: false },
    { id: 3, name: "Jake Doe", email: "jake@example.com", status: "eligible", lastVisit: "Dec 18, 2024", isPrimary: false },
  ];

  const baseIncluded = 2;
  const additionalMembers = householdMembers.length - baseIncluded;

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
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button>Add Member (+$25/mo)</Button>
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

          <div className="divide-y divide-border/50">
            {householdMembers.map((member) => (
              <div key={member.id} className="p-4 lg:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-lg text-primary">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {member.isPrimary && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === "eligible" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {member.status === "eligible" ? (
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
                    <p className="text-xs text-muted-foreground mt-1">Last: {member.lastVisit}</p>
                  </div>

                  {!member.isPrimary && (
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
