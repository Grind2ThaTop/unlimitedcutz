import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Eye, EyeOff, RefreshCw, Check, ChevronsUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type MemberRank = Database['public']['Enums']['member_rank'];
type AccountType = Database['public']['Enums']['account_type'];

interface UserOption {
  id: string;
  email: string;
  full_name: string | null;
  referral_code: string | null;
}

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  account_type: z.enum(['client', 'barber'] as const),
  initial_rank: z.enum(['rookie', 'hustla', 'grinder', 'influencer', 'executive', 'partner'] as const),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  sponsor_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    email: string;
    full_name: string;
    password: string;
    account_type: 'client' | 'barber';
    initial_rank: string;
    referral_code?: string;
  }) => void;
  isLoading: boolean;
  users: UserOption[];
}

const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const AddUserDialog = ({ open, onOpenChange, onSubmit, isLoading, users }: AddUserDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      full_name: '',
      account_type: 'client',
      initial_rank: 'rookie',
      password: generatePassword(),
      sponsor_id: '',
    },
  });

  const selectedSponsorId = form.watch('sponsor_id');
  
  const selectedSponsor = useMemo(() => {
    if (!selectedSponsorId) return null;
    return users.find(u => u.id === selectedSponsorId) || null;
  }, [selectedSponsorId, users]);

  const handleGeneratePassword = () => {
    form.setValue('password', generatePassword());
  };

  const handleSubmit = (values: FormValues) => {
    // Find the referral code for the selected sponsor
    const sponsor = users.find(u => u.id === values.sponsor_id);
    
    onSubmit({
      email: values.email,
      full_name: values.full_name,
      password: values.password,
      account_type: values.account_type,
      initial_rank: values.initial_rank,
      referral_code: sponsor?.referral_code || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        email: '',
        full_name: '',
        account_type: 'client',
        initial_rank: 'rookie',
        password: generatePassword(),
        sponsor_id: '',
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Manually create a new user account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="barber">Barber</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initial_rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Rank</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rookie">Rookie</SelectItem>
                        <SelectItem value="hustla">Hustla</SelectItem>
                        <SelectItem value="grinder">Grinder</SelectItem>
                        <SelectItem value="influencer">Influencer</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          {...field} 
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGeneratePassword}
                        title="Generate new password"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsor_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Place Under (Optional)</FormLabel>
                  <Popover open={sponsorOpen} onOpenChange={setSponsorOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={sponsorOpen}
                          className={cn(
                            "w-full justify-between font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {selectedSponsor 
                            ? `${selectedSponsor.full_name || 'Unknown'} (${selectedSponsor.email})`
                            : "Select a sponsor..."
                          }
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandList>
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value=""
                              onSelect={() => {
                                form.setValue('sponsor_id', '');
                                setSponsorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              None (Root level)
                            </CommandItem>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.full_name || ''} ${user.email}`}
                                onSelect={() => {
                                  form.setValue('sponsor_id', user.id);
                                  setSponsorOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{user.full_name || 'Unknown'}</span>
                                  <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
