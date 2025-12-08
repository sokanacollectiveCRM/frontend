import { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Download,
  Mail,
  Phone,
  MoreHorizontal,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Button } from '@/common/components/ui/button';
import { Header } from '@/common/layouts/Header';
import UserAvatar from '@/common/components/user/UserAvatar';
import { Badge } from '@/common/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Label } from '@/common/components/ui/label';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { toast } from 'sonner';

interface TeamMember {
  //Team member interface
  id: string;
  firstname: string;
  lastname: string;
  role: string;
  email: string;
  bio: string;
}

export default function Teams() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); //Team members state
  const [isLoading, setIsLoading] = useState(true); //Loading state
  const [searchQuery, setSearchQuery] = useState(''); //Search query state
  const [inviteForm, setInviteForm] = useState({
    //Invite form data state
    email: '',
    firstname: '',
    lastname: '',
    role: 'doula',
  });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    role: 'doula',
    bio: '',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const fetchTeam = async () => {
    //function to fetch all team members
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/all`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch team members');
      }

      const data = await response.json();
      const teamMemberData = data.map((member: any) => ({
        firstname: member.firstname,
        lastname: member.lastname,
        role: member.role,
        email: member.email,
        id: member.id,
        bio: member.bio,
      }));
      setTeamMembers(teamMemberData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = searchQuery //function to use search query to get the desired team member
    ? teamMembers.filter(
        (member) =>
          `${member.firstname} ${member.lastname}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teamMembers;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //handles change of search
    setSearchQuery(e.target.value);
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setEditForm({
      firstname: member.firstname,
      lastname: member.lastname,
      email: member.email,
      role: member.role,
      bio: member.bio || '',
    });
    setEditDialogOpen(true);
  };

  const handleMessageClick = (member: TeamMember) => {
    window.open(`mailto:${member.email}`, '_blank');
  };

  const handleDeleteClick = (memberId: string) => {
    setMemberToDelete(memberId);
    setDeleteConfirmOpen(true);
  };

  const updateMember = async () => {
    if (!editingMember) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No auth token found');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/${editingMember.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstname: editForm.firstname,
            lastname: editForm.lastname,
            email: editForm.email,
            role: editForm.role,
            bio: editForm.bio,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to update team member';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success('Team member updated successfully');
      setEditDialogOpen(false);
      setEditingMember(null);
      fetchTeam(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating team member:', error);
      toast.error(error.message || 'Failed to update team member');
    }
  };

  const deleteMember = async () => {
    if (!memberToDelete) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No auth token found');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/${memberToDelete}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        let errorMessage = 'Failed to delete member';
        let errorText = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorText = errorMessage;
        } catch {
          errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        // Check for foreign key constraint violations
        if (
          errorText.includes('foreign key constraint') ||
          errorText.includes('violates foreign key') ||
          errorText.includes('fkey')
        ) {
          // Extract which table is causing the constraint
          let relatedTable = 'related records';
          if (errorText.includes('contract')) {
            relatedTable = 'contracts';
          } else if (errorText.includes('note')) {
            relatedTable = 'notes';
          } else if (errorText.includes('activit')) {
            relatedTable = 'notes or activities';
          } else if (errorText.includes('client')) {
            relatedTable = 'clients';
          }

          const member = teamMembers.find((m) => m.id === memberToDelete);
          const memberName = member
            ? `${member.firstname} ${member.lastname}`
            : 'This team member';

          toast.error(
            `Cannot remove ${memberName}. They have ${relatedTable} associated with their account. Please remove or reassign these records first.`,
            {
              duration: 6000,
            }
          );
          return;
        }

        throw new Error(errorMessage);
      }
      toast.success('Team member removed successfully');
      setTeamMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberToDelete)
      );
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    } catch (error: any) {
      console.error('Error deleting member:', error);
      // Only show generic error if we haven't already shown a specific one
      if (
        !error.message?.includes('foreign key') &&
        !error.message?.includes('violates')
      ) {
        toast.error(error.message || 'Failed to delete team member');
      }
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    //Function to handle click of invite team member button on teams page
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/add`,
        {
          //create new user in users table to allow them to sign in
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstname: `${inviteForm.firstname}`,
            lastname: `${inviteForm.lastname}`,
            email: `${inviteForm.email}`,
            role: `${inviteForm.role}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite team member');
      }

      const emailResponse = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/email/team-invite`,
        {
          //send the email invite after user is created
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: inviteForm.email,
            firstname: inviteForm.firstname,
            lastname: inviteForm.lastname,
            role: inviteForm.role,
          }),
        }
      );

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Failed to send invite email:', errorData);
        throw new Error(errorData.error || 'Failed to send invite email');
      }

      fetchTeam(); //Refresh to include new team & clear invite form
      setInviteForm({
        email: '',
        firstname: '',
        lastname: '',
        role: 'doula',
      });
    } catch (error) {
      console.error('Error inviting team member:', error);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header Section */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Team Members</h1>
              <p className='text-sm text-gray-500 mt-1'>
                Manage your team and collaborate effectively
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              <div className='relative w-full sm:w-80'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search by name, email, or role...'
                  className='pl-10 h-10 bg-white border-gray-300 focus:border-green-600 focus:ring-green-600'
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div className='flex gap-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white h-10 px-4'>
                      <UserPlus size={18} />
                      <span>Invite Member</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-96'>
                    <div className='mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Invite Team Member
                      </h3>
                      <p className='text-sm text-gray-500'>
                        Send an invitation to join your team
                      </p>
                    </div>
                    <form onSubmit={handleInviteSubmit} className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='email' className='text-sm font-medium'>
                          Email Address
                        </Label>
                        <Input
                          id='email'
                          type='email'
                          placeholder='colleague@example.com'
                          value={inviteForm.email}
                          onChange={(e) =>
                            setInviteForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className='h-10'
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='firstname'
                            className='text-sm font-medium'
                          >
                            First Name
                          </Label>
                          <Input
                            id='firstname'
                            type='text'
                            placeholder='John'
                            value={inviteForm.firstname}
                            onChange={(e) =>
                              setInviteForm((prev) => ({
                                ...prev,
                                firstname: e.target.value,
                              }))
                            }
                            className='h-10'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='lastname'
                            className='text-sm font-medium'
                          >
                            Last Name
                          </Label>
                          <Input
                            id='lastname'
                            type='text'
                            placeholder='Doe'
                            value={inviteForm.lastname}
                            onChange={(e) =>
                              setInviteForm((prev) => ({
                                ...prev,
                                lastname: e.target.value,
                              }))
                            }
                            className='h-10'
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='role' className='text-sm font-medium'>
                          Role
                        </Label>
                        <select
                          id='role'
                          className='w-full rounded-md border border-input bg-background px-3 py-2 h-10'
                          value={inviteForm.role}
                          onChange={(e) =>
                            setInviteForm((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }))
                          }
                        >
                          <option value='doula'>Doula</option>
                          <option value='admin'>Admin</option>
                        </select>
                      </div>
                      <Button
                        type='submit'
                        className='w-full bg-green-600 hover:bg-green-700 h-10'
                      >
                        Send Invitation
                      </Button>
                    </form>
                  </PopoverContent>
                </Popover>

                <Button
                  variant='outline'
                  className='flex items-center gap-2 h-10 px-4 border-gray-300 hover:bg-gray-50'
                >
                  <Download size={18} />
                  <span>Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className='bg-white rounded-xl border border-gray-200 p-6 animate-pulse'
              >
                <div className='flex items-center gap-4 mb-4'>
                  <div className='h-14 w-14 rounded-full bg-gray-200'></div>
                  <div className='flex-1'>
                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='h-3 bg-gray-200 rounded'></div>
                  <div className='h-3 bg-gray-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredMembers.map((member, index) => (
              <Card
                key={index}
                className='group bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 overflow-hidden'
              >
                <CardHeader className='pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-4 flex-1'>
                      <div className='relative'>
                        <UserAvatar
                          fullName={`${member?.firstname || ''} ${member?.lastname || ''}`}
                          className='h-14 w-14 ring-2 ring-gray-100 group-hover:ring-green-200 transition-all'
                        />
                        <div className='absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white'></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-lg font-semibold text-gray-900 mb-1 truncate'>
                          {member.firstname} {member.lastname}
                        </CardTitle>
                        <Badge
                          variant='outline'
                          className={`mt-1 font-medium text-xs ${
                            member.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100'
                        >
                          <MoreHorizontal className='h-4 w-4 text-gray-600' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40'>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(member)}
                          className='cursor-pointer'
                        >
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleMessageClick(member)}
                          className='cursor-pointer'
                        >
                          <span>Message</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600 cursor-pointer focus:text-red-600'
                          onClick={() => handleDeleteClick(member.id)}
                        >
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className='pt-0 space-y-3'>
                  <div className='flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors'>
                    <div className='flex-shrink-0'>
                      <Mail className='h-4 w-4 text-gray-400' />
                    </div>
                    <a
                      href={`mailto:${member.email}`}
                      className='truncate hover:underline'
                    >
                      {member.email}
                    </a>
                  </div>
                  <div className='flex items-center gap-3 text-sm text-gray-500'>
                    <div className='flex-shrink-0'>
                      <Phone className='h-4 w-4 text-gray-400' />
                    </div>
                    <span className='text-gray-400 italic'>
                      No phone listed
                    </span>
                  </div>
                  {member.bio && (
                    <div className='pt-2 border-t border-gray-100'>
                      <p className='text-xs text-gray-500 line-clamp-2'>
                        {member.bio}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200'>
            <div className='rounded-full bg-gray-100 p-4 mb-4'>
              <Search className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No team members found
            </h3>
            <p className='text-gray-500 max-w-md'>
              {searchQuery
                ? "We couldn't find any team members matching your search. Try adjusting your search terms."
                : "Get started by inviting your first team member. Click 'Invite Member' to begin."}
            </p>
            {!searchQuery && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button className='mt-6 bg-green-600 hover:bg-green-700'>
                    <UserPlus size={18} className='mr-2' />
                    Invite Your First Member
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-96'>
                  <div className='mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Invite Team Member
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Send an invitation to join your team
                    </p>
                  </div>
                  <form onSubmit={handleInviteSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='email-empty' className='text-sm font-medium'>
                        Email Address
                      </Label>
                      <Input
                        id='email-empty'
                        type='email'
                        placeholder='colleague@example.com'
                        value={inviteForm.email}
                        onChange={(e) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className='h-10'
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='firstname-empty'
                          className='text-sm font-medium'
                        >
                          First Name
                        </Label>
                        <Input
                          id='firstname-empty'
                          type='text'
                          placeholder='John'
                          value={inviteForm.firstname}
                          onChange={(e) =>
                            setInviteForm((prev) => ({
                              ...prev,
                              firstname: e.target.value,
                            }))
                          }
                          className='h-10'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='lastname-empty'
                          className='text-sm font-medium'
                        >
                          Last Name
                        </Label>
                        <Input
                          id='lastname-empty'
                          type='text'
                          placeholder='Doe'
                          value={inviteForm.lastname}
                          onChange={(e) =>
                            setInviteForm((prev) => ({
                              ...prev,
                              lastname: e.target.value,
                            }))
                          }
                          className='h-10'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='role-empty' className='text-sm font-medium'>
                        Role
                      </Label>
                      <select
                        id='role-empty'
                        className='w-full rounded-md border border-input bg-background px-3 py-2 h-10'
                        value={inviteForm.role}
                        onChange={(e) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                      >
                        <option value='doula'>Doula</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </div>
                    <Button
                      type='submit'
                      className='w-full bg-green-600 hover:bg-green-700 h-10'
                    >
                      Send Invitation
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>

      {/* Edit Team Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the team member's information below.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-firstname'>First Name</Label>
              <Input
                id='edit-firstname'
                value={editForm.firstname}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, firstname: e.target.value }))
                }
                placeholder='Enter first name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-lastname'>Last Name</Label>
              <Input
                id='edit-lastname'
                value={editForm.lastname}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, lastname: e.target.value }))
                }
                placeholder='Enter last name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-email'>Email</Label>
              <Input
                id='edit-email'
                type='email'
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder='Enter email address'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-role'>Role</Label>
              <select
                id='edit-role'
                className='w-full rounded-md border border-input bg-background px-3 py-2'
                value={editForm.role}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value='doula'>Doula</option>
                <option value='admin'>Admin</option>
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-bio'>Bio (Optional)</Label>
              <textarea
                id='edit-bio'
                className='w-full rounded-md border border-input bg-background px-3 py-2 min-h-[80px]'
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder='Enter bio'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setEditDialogOpen(false);
                setEditingMember(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={updateMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this team member? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setDeleteConfirmOpen(false);
                setMemberToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={deleteMember}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
