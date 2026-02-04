import {
  assignDoula,
  AssignedDoula,
  Doula,
  fetchAssignedDoulas,
  fetchAvailableDoulas,
  unassignDoula,
} from '@/api/clients/doulaAssignments';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Button } from '@/common/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/common/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface DoulaAssignmentProps {
  clientId: string;
  canAssign: boolean;
}

export function DoulaAssignment({ clientId, canAssign }: DoulaAssignmentProps) {
  const [availableDoulas, setAvailableDoulas] = useState<Doula[]>([]);
  const [assignedDoulas, setAssignedDoulas] = useState<AssignedDoula[]>([]);
  const [selectedDoulaId, setSelectedDoulaId] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState({ list: false, assign: false, remove: null as string | null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    setError(null);

    try {
      const [doulas, assigned] = await Promise.all([
        fetchAvailableDoulas(),
        fetchAssignedDoulas(clientId),
      ]);

      console.log('🔍 Doula Assignment - Available doulas:', doulas);
      console.log('🔍 Doula Assignment - Assigned doulas:', assigned);

      setAvailableDoulas(doulas);
      setAssignedDoulas(assigned);
    } catch (err) {
      console.error('Error loading doula data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load doula data');
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  const handleAssign = async () => {
    if (!selectedDoulaId) return;

    // Check if doula is already assigned
    const isAlreadyAssigned = assignedDoulas.some((a) => a.doulaId === selectedDoulaId);
    if (isAlreadyAssigned) {
      toast.error('This doula is already assigned to this client');
      return;
    }

    setLoading((prev) => ({ ...prev, assign: true }));
    setError(null);

    try {
      await assignDoula(clientId, selectedDoulaId);
      toast.success('Doula assigned successfully');
      setSelectedDoulaId('');
      setOpen(false); // Close popover after assignment

      // Refetch assigned doulas
      const assigned = await fetchAssignedDoulas(clientId);
      setAssignedDoulas(assigned);
    } catch (err) {
      console.error('Error assigning doula:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to assign doula';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, assign: false }));
    }
  };

  const handleRemove = async (doulaId: string) => {
    setLoading((prev) => ({ ...prev, remove: doulaId }));
    setError(null);

    try {
      await unassignDoula(clientId, doulaId);
      toast.success('Doula unassigned successfully');

      // Refetch assigned doulas
      const assigned = await fetchAssignedDoulas(clientId);
      setAssignedDoulas(assigned);
    } catch (err) {
      console.error('Error removing doula:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove doula';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, remove: null }));
    }
  };

  const getInitials = (firstname: string, lastname: string): string => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  // Get selected doula details
  const selectedDoula = availableDoulas.find((d) => d.id === selectedDoulaId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-base">Doula Assignment</h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Assign new doula section - only show if user has permission */}
      {canAssign && (
        <div className="space-y-3">
          {/* Combobox with search and Assign Button */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Select Doula {availableDoulas.length > 0 && `(${availableDoulas.length} available)`}
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={loading.list || availableDoulas.length === 0}
                    className="w-full justify-between"
                  >
                    {loading.list ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading doulas...
                      </>
                    ) : selectedDoula ? (
                      <span className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {getInitials(selectedDoula.firstname, selectedDoula.lastname)}
                        </div>
                        <span>{selectedDoula.firstname} {selectedDoula.lastname}</span>
                        <span className="text-muted-foreground text-xs">({selectedDoula.email})</span>
                      </span>
                    ) : availableDoulas.length === 0 ? (
                      "No doulas available"
                    ) : (
                      "Search and select a doula..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 z-[10000]"
                  align="start"
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                  sideOffset={5}
                >
                  <Command>
                    <CommandInput placeholder="Search by name or email..." />
                    <CommandList>
                      <CommandEmpty>No doulas found.</CommandEmpty>
                      <CommandGroup>
                        {availableDoulas.map((doula) => (
                          <CommandItem
                            key={doula.id}
                            value={`${doula.firstname} ${doula.lastname} ${doula.email}`}
                            onSelect={() => {
                              setSelectedDoulaId(doula.id === selectedDoulaId ? '' : doula.id);
                              console.log('🔍 Selected doula ID:', doula.id);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedDoulaId === doula.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {doula.profile_picture ? (
                                <img
                                  src={doula.profile_picture}
                                  alt={`${doula.firstname} ${doula.lastname}`}
                                  className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                  {getInitials(doula.firstname, doula.lastname)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {doula.firstname} {doula.lastname}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {doula.email}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleAssign}
              disabled={!selectedDoulaId || loading.assign || loading.list || availableDoulas.length === 0}
              size="default"
            >
              {loading.assign ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign
                </>
              )}
            </Button>
          </div>

          {/* Clear selection button */}
          {selectedDoulaId && !loading.assign && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDoulaId('');
                setOpen(false);
              }}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear selection
            </Button>
          )}

          {/* Helper text */}
          {!loading.list && availableDoulas.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No doulas are currently available in the team. Please add doula team members first.
            </p>
          )}
        </div>
      )}

      {/* List of assigned doulas */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          Assigned Doulas {loading.list && <span className="text-xs">(Loading...)</span>}
        </h4>

        {loading.list && assignedDoulas.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading doulas...
          </div>
        ) : assignedDoulas.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
            No doulas assigned yet
          </div>
        ) : (
          <div className="space-y-2">
            {assignedDoulas.map((assignment) => {
              const { doula } = assignment;
              const isRemoving = loading.remove === assignment.doulaId;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  {/* Avatar/Initials */}
                  <div className="flex-shrink-0">
                    {doula.profile_picture ? (
                      <img
                        src={doula.profile_picture}
                        alt={`${doula.firstname} ${doula.lastname}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {getInitials(doula.firstname, doula.lastname)}
                      </div>
                    )}
                  </div>

                  {/* Doula Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {doula.firstname} {doula.lastname}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{doula.email}</div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {assignment.status}
                    </span>
                    {canAssign && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(assignment.doulaId)}
                        disabled={isRemoving}
                        className="h-8 w-8 p-0"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
