import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone, UserPlus, MailPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Label } from '@/common/components/ui/label';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import UserAvatar from '@/common/components/user/UserAvatar';
import type { Doula } from '@/features/hours/types/doula';
import { toast } from 'sonner';
import { UserContext } from '@/common/contexts/UserContext';
import { MatchClientModal } from './MatchClientModal';

export default function DoulaListPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useContext(UserContext);
  const [doulas, setDoulas] = useState<Doula[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedDoula, setSelectedDoula] = useState<Doula | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
  });
  const [isInviting, setIsInviting] = useState(false);

  // Admin-only access check
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    fetchDoulas();
  }, []);

  const fetchDoulas = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/all`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        setDoulas([]);
        return;
      }

      const data = await response.json();
      const doulaData = data
        .filter((member: any) => member.role === 'doula')
        .map((member: any) => ({
          id: member.id,
          first_name: member.firstname,
          last_name: member.lastname,
          email: member.email,
          phone: member.phone || 'No phone listed',
          address: member.address || '',
          profile_photo_url: null,
          years_experience: null,
          specialties: null,
          certifications: null,
          bio: member.bio || null,
          contract_status: 'not_sent' as const,
          contract_signed_at: null,
          certifications_files: null,
          created_at: member.created_at || new Date().toISOString(),
        }));

      setDoulas(doulaData);
    } catch {
      setDoulas([]);
    }
  };

  const handleMatchClient = (doula: Doula, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setSelectedDoula(doula);
    setMatchModalOpen(true);
  };

  const handleMatchSuccess = () => {
    // Optionally refresh doulas or show success message
    toast.success('Client matched successfully');
    // You could refresh the doula list here if needed
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const API_BASE =
        (import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050') + '/api';

      // Use the admin doula invite endpoint
      const response = await fetch(`${API_BASE}/admin/doulas/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteForm.email,
          firstname: inviteForm.firstname,
          lastname: inviteForm.lastname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to invite doula');
      }

      const data = await response.json();
      toast.success(data.message || 'Doula invited successfully');

      // Refresh doula list and reset form
      fetchDoulas();
      setInviteForm({ email: '', firstname: '', lastname: '' });
      setInviteDialogOpen(false);
    } catch (error: any) {
      console.error('Error inviting doula:', error);
      toast.error(error.message || 'Failed to invite doula');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredDoulas = searchQuery
    ? doulas.filter(
        (doula) =>
          `${doula.first_name} ${doula.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          doula.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doula.phone.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : doulas;

  const getContractStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return (
          <Badge className='bg-green-100 text-green-700 border-green-200'>
            Contract Signed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='bg-amber-100 text-amber-700 border-amber-200'>
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className='bg-gray-100 text-gray-700 border-gray-200'>
            Not Sent
          </Badge>
        );
    }
  };

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-4'>
          <div className='mb-6 flex justify-between items-start'>
            <div>
              <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
                Doulas
              </h2>
              <p className='text-sm text-gray-500 mt-1'>
                Manage doulas and view their profiles
              </p>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <MailPlus className='h-4 w-4 mr-2' />
              Invite Doula
            </Button>
          </div>

          <div className='mb-6'>
            <div className='relative w-full sm:w-80'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search by name, email, or phone...'
                className='pl-10 h-10 bg-white border-gray-300 focus:border-green-600 focus:ring-green-600'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredDoulas.length === 0 && (
            <div className='flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200'>
              <div className='rounded-full bg-gray-100 p-4 mb-4'>
                <Search className='h-8 w-8 text-gray-400' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                {searchQuery ? 'No doulas found' : 'No doulas yet'}
              </h3>
              <p className='text-gray-500 max-w-md'>
                {searchQuery
                  ? "We couldn't find any doulas matching your search."
                  : 'Get started by adding doulas to your team.'}
              </p>
            </div>
          )}

          {filteredDoulas.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredDoulas.map((doula) => (
                <Card
                  key={doula.id}
                  className='group bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200'
                >
                  <CardHeader className='pb-4'>
                    <div className='flex items-center gap-4'>
                      <div
                        onClick={() => navigate(`/hours/${doula.id}`)}
                        className='cursor-pointer'
                      >
                        <UserAvatar
                          fullName={`${doula.first_name} ${doula.last_name}`}
                          className='h-14 w-14 ring-2 ring-gray-100 group-hover:ring-green-200 transition-all'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <CardTitle
                          className='text-lg font-semibold text-gray-900 mb-1 truncate cursor-pointer hover:text-green-600'
                          onClick={() => navigate(`/hours/${doula.id}`)}
                        >
                          {doula.first_name} {doula.last_name}
                        </CardTitle>
                        {getContractStatusBadge(doula.contract_status)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='pt-0 space-y-3'>
                    <div className='flex items-center gap-3 text-sm text-gray-600'>
                      <Mail className='h-4 w-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{doula.email}</span>
                    </div>
                    <div className='flex items-center gap-3 text-sm text-gray-600'>
                      <Phone className='h-4 w-4 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>{doula.phone}</span>
                    </div>
                    <div className='pt-2 border-t border-gray-100'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='w-full'
                        onClick={(e) => handleMatchClient(doula, e)}
                      >
                        <UserPlus className='h-4 w-4 mr-2' />
                        Match Client
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Match Client Modal */}
          {selectedDoula && (
            <MatchClientModal
              doula={{
                id: selectedDoula.id,
                first_name: selectedDoula.first_name,
                last_name: selectedDoula.last_name,
                email: selectedDoula.email,
              }}
              isOpen={matchModalOpen}
              onClose={() => {
                setMatchModalOpen(false);
                setSelectedDoula(null);
              }}
              onSuccess={handleMatchSuccess}
            />
          )}

          {/* Invite Doula Dialog */}
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <MailPlus className='h-5 w-5' />
                  Invite Doula
                </DialogTitle>
                <DialogDescription>
                  Invite a new doula to join your team. They will receive an email
                  invitation to create their account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstname'>First Name</Label>
                  <Input
                    id='firstname'
                    value={inviteForm.firstname}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, firstname: e.target.value }))
                    }
                    placeholder='Enter first name'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastname'>Last Name</Label>
                  <Input
                    id='lastname'
                    value={inviteForm.lastname}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, lastname: e.target.value }))
                    }
                    placeholder='Enter last name'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder='Enter email address'
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setInviteDialogOpen(false);
                      setInviteForm({ email: '', firstname: '', lastname: '' });
                    }}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={isInviting}>
                    {isInviting ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Main>
    </>
  );
}
