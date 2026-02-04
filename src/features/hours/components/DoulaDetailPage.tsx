import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '@/common/contexts/UserContext';
import {
  Mail,
  Phone,
  MapPin,
  Edit,
  FileText,
  Send,
  Download,
  Calendar,
  Users,
  Clock,
  MessageSquare,
  Activity,
  ChevronLeft,
  Award,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import UserAvatar from '@/common/components/user/UserAvatar';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import {
  getDoulaById,
  getAssignedClients,
  getDoulaVisits,
  getDoulaNotes,
  getActivityLog,
} from '@/api/doulas/doulaApi';
import type {
  Doula,
  AssignedClient,
  Visit,
  DoulaNote,
  ActivityLog,
} from '@/features/hours/types/doula';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { EditDoulaDialog } from './EditDoulaDialog';

export default function DoulaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useContext(UserContext);
  const [doula, setDoula] = useState<Doula | null>(null);
  const [assignedClients, setAssignedClients] = useState<AssignedClient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [notes, setNotes] = useState<DoulaNote[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Admin-only access check
  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/hours');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (id && (!authLoading && user?.role === 'admin')) {
      fetchDoulaData();
    }
  }, [id, authLoading, user]);

  const fetchDoulaData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // For now, fetch from team members API (replace with real doula endpoints when available)

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
        throw new Error('Failed to fetch doula');
      }

      const data = await response.json();
      const doulaMember = data.find((member: any) => member.id === id);

      if (!doulaMember) {
        toast.error('Doula not found');
        navigate('/hours');
        return;
      }

      // Map to Doula type
      const doulaData: Doula = {
        id: doulaMember.id,
        first_name: doulaMember.firstname,
        last_name: doulaMember.lastname,
        email: doulaMember.email,
        phone: doulaMember.phone || 'No phone listed',
        address: doulaMember.address || '',
        profile_photo_url: null,
        years_experience: null,
        specialties: null,
        certifications: null,
        bio: doulaMember.bio || null,
        contract_status: 'not_sent',
        contract_signed_at: null,
        certifications_files: null,
        created_at: doulaMember.created_at || new Date().toISOString(),
      };

      setDoula(doulaData);
      // TODO: Fetch assigned clients, visits, notes, activity log when API endpoints are ready
      setAssignedClients([]);
      setVisits([]);
      setNotes([]);
      setActivityLog([]);
    } catch (error: any) {
      console.error('Error fetching doula data:', error);
      toast.error(error.message || 'Failed to load doula profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
      case 'active':
        return (
          <Badge className='bg-green-100 text-green-700 border-green-200'>
            {status === 'signed' ? 'Contract Signed' : 'Active'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='bg-amber-100 text-amber-700 border-amber-200'>
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className='bg-red-100 text-red-700 border-red-200'>
            Overdue
          </Badge>
        );
      case 'completed':
        return (
          <Badge className='bg-blue-100 text-blue-700 border-blue-200'>
            Completed
          </Badge>
        );
      default:
        return (
          <Badge className='bg-gray-100 text-gray-700 border-gray-200'>
            {status}
          </Badge>
        );
    }
  };

  if (isLoading || !doula) {
    return (
      <>
        <Header fixed>
          <ProfileDropdown />
        </Header>
        <LoadingOverlay isLoading={true} />
      </>
    );
  }

  const upcomingVisits = visits.filter(
    (v) => v.status === 'scheduled' && new Date(v.visit_date) >= new Date()
  );
  const pastVisits = visits.filter(
    (v) => v.status === 'completed' || new Date(v.visit_date) < new Date()
  );
  const overdueVisits = visits.filter((v) => v.status === 'overdue');

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex-1 overflow-auto p-6'>
          {/* Back Button */}
          <Button
            variant='ghost'
            onClick={() => navigate('/hours')}
            className='mb-4'
          >
            <ChevronLeft className='h-4 w-4 mr-2' />
            Back to Doulas
          </Button>

          {/* HEADER CARD */}
          <Card className='mb-6 rounded-xl border border-gray-200 bg-white shadow-sm'>
            <CardHeader>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
                <UserAvatar
                  fullName={`${doula.first_name} ${doula.last_name}`}
                  className='h-20 w-20 ring-2 ring-gray-100'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <CardTitle className='text-3xl font-bold text-gray-900'>
                      {doula.first_name} {doula.last_name}
                    </CardTitle>
                    {getStatusBadge(
                      doula.contract_status === 'signed'
                        ? 'active'
                        : doula.contract_status
                    )}
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-gray-400' />
                      <span>{doula.email}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-gray-400' />
                      <span>{doula.phone}</span>
                    </div>
                    {doula.address && (
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-gray-400' />
                        <span>{doula.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit className='h-4 w-4 mr-2' />
                    Edit Profile
                  </Button>
                  {doula.contract_status === 'signed' && (
                    <Button variant='outline' size='sm'>
                      <FileText className='h-4 w-4 mr-2' />
                      View Contract
                    </Button>
                  )}
                  {doula.contract_status === 'pending' && (
                    <Button variant='outline' size='sm'>
                      <Send className='h-4 w-4 mr-2' />
                      Resend Contract
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* LEFT COLUMN - Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* PROFESSIONAL INFORMATION */}
              <Card className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-gray-800'>
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {doula.years_experience && (
                    <div>
                      <p className='text-sm text-gray-500 mb-1'>
                        Years of Experience
                      </p>
                      <p className='text-gray-900'>{doula.years_experience}</p>
                    </div>
                  )}
                  {/* Certifications as Files */}
                  {doula.certifications_files &&
                    doula.certifications_files.length > 0 && (
                      <div>
                        <p className='text-sm text-gray-500 mb-2'>
                          Certifications
                        </p>
                        <div className='space-y-2'>
                          {doula.certifications_files.map((fileUrl, idx) => {
                            const fileName =
                              fileUrl.split('/').pop() || `Certification ${idx + 1}`;
                            return (
                              <a
                                key={idx}
                                href={fileUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group'
                              >
                                <FileText className='h-4 w-4 text-blue-600 flex-shrink-0' />
                                <span className='text-sm text-gray-700 group-hover:text-blue-600 flex-1 truncate'>
                                  {fileName}
                                </span>
                                <Download className='h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0' />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  {/* Legacy text certifications (if any) */}
                  {doula.certifications &&
                    doula.certifications.length > 0 &&
                    (!doula.certifications_files ||
                      doula.certifications_files.length === 0) && (
                      <div>
                        <p className='text-sm text-gray-500 mb-2'>
                          Certifications
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {doula.certifications.map((cert, idx) => (
                            <Badge
                              key={idx}
                              variant='outline'
                              className='bg-blue-50 text-blue-700 border-blue-200'
                            >
                              <Award className='h-3 w-3 mr-1' />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {doula.specialties && doula.specialties.length > 0 && (
                    <div>
                      <p className='text-sm text-gray-500 mb-2'>Specialties</p>
                      <div className='flex flex-wrap gap-2'>
                        {doula.specialties.map((specialty, idx) => (
                          <Badge
                            key={idx}
                            variant='outline'
                            className='bg-purple-50 text-purple-700 border-purple-200'
                          >
                            <Briefcase className='h-3 w-3 mr-1' />
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {doula.bio && (
                    <div>
                      <p className='text-sm text-gray-500 mb-2'>About</p>
                      <p className='text-gray-900'>{doula.bio}</p>
                    </div>
                  )}
                  {!doula.years_experience &&
                    !doula.certifications?.length &&
                    !doula.specialties?.length &&
                    !doula.bio && (
                      <p className='text-gray-500 text-sm'>
                        No professional information available
                      </p>
                    )}
                </CardContent>
              </Card>

              {/* CONTRACT INFORMATION */}
              <Card className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-gray-800'>
                    Contract Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-500 mb-2'>Contract Status</p>
                    {getStatusBadge(doula.contract_status)}
                  </div>
                  {doula.contract_signed_at && (
                    <div>
                      <p className='text-sm text-gray-500 mb-1'>
                        Date Signed
                      </p>
                      <p className='text-gray-900'>
                        {format(
                          new Date(doula.contract_signed_at),
                          'MMMM dd, yyyy'
                        )}
                      </p>
                    </div>
                  )}
                  {doula.contract_status === 'signed' && (
                    <Button variant='outline' size='sm'>
                      <Download className='h-4 w-4 mr-2' />
                      Download Contract PDF
                    </Button>
                  )}
                  {doula.certifications_files &&
                    doula.certifications_files.length > 0 && (
                      <div>
                        <p className='text-sm text-gray-500 mb-2'>
                          Certification Files
                        </p>
                        <div className='space-y-1'>
                          {doula.certifications_files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-sm text-blue-600 hover:underline flex items-center gap-2'
                            >
                              <FileText className='h-4 w-4' />
                              {file.split('/').pop()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* ASSIGNED CLIENTS */}
              <Card className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg font-semibold text-gray-800'>
                      Assigned Clients
                    </CardTitle>
                    <Badge variant='outline' className='bg-gray-50'>
                      {assignedClients.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignedClients.length > 0 ? (
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className='border-b'>
                            <th className='text-left py-2 text-sm font-medium text-gray-700'>
                              Client Name
                            </th>
                            <th className='text-left py-2 text-sm font-medium text-gray-700'>
                              Due Date
                            </th>
                            <th className='text-left py-2 text-sm font-medium text-gray-700'>
                              Status
                            </th>
                            <th className='text-left py-2 text-sm font-medium text-gray-700'>
                              Last Note
                            </th>
                            <th className='text-left py-2 text-sm font-medium text-gray-700'>
                              Next Visit
                            </th>
                            <th className='text-left py-2 text-sm font-medium text-gray-700'>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedClients.map((client) => (
                            <tr key={client.id} className='border-b hover:bg-gray-50'>
                              <td className='py-3 text-sm text-gray-900'>
                                {client.client_name}
                              </td>
                              <td className='py-3 text-sm text-gray-600'>
                                {format(
                                  new Date(client.due_date),
                                  'MMM dd, yyyy'
                                )}
                              </td>
                              <td className='py-3'>
                                {getStatusBadge(client.status)}
                              </td>
                              <td className='py-3 text-sm text-gray-600 max-w-xs truncate'>
                                {client.last_note || '—'}
                              </td>
                              <td className='py-3 text-sm text-gray-600'>
                                {client.next_visit
                                  ? format(
                                      new Date(client.next_visit),
                                      'MMM dd, yyyy'
                                    )
                                  : '—'}
                              </td>
                              <td className='py-3'>
                                <Button variant='ghost' size='sm'>
                                  View Profile
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      <Users className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                      <p>No clients assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* VISIT SCHEDULE */}
              <Card className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-gray-800'>
                    Visit Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Upcoming Visits */}
                  {upcomingVisits.length > 0 && (
                    <div>
                      <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        Upcoming Visits
                      </h4>
                      <div className='space-y-2'>
                        {upcomingVisits.map((visit) => (
                          <div
                            key={visit.id}
                            className='flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200'
                          >
                            <div>
                              <p className='font-medium text-gray-900'>
                                {format(
                                  new Date(visit.visit_date),
                                  'MMMM dd, yyyy'
                                )}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {visit.visit_type}
                              </p>
                            </div>
                            {getStatusBadge(visit.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overdue Visits */}
                  {overdueVisits.length > 0 && (
                    <div>
                      <h4 className='text-sm font-semibold text-red-700 mb-3 flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        Overdue Visits
                      </h4>
                      <div className='space-y-2'>
                        {overdueVisits.map((visit) => (
                          <div
                            key={visit.id}
                            className='flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200'
                          >
                            <div>
                              <p className='font-medium text-gray-900'>
                                {format(
                                  new Date(visit.visit_date),
                                  'MMMM dd, yyyy'
                                )}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {visit.visit_type}
                              </p>
                            </div>
                            {getStatusBadge(visit.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Visits */}
                  {pastVisits.length > 0 && (
                    <div>
                      <h4 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        Past Visits
                      </h4>
                      <div className='space-y-2'>
                        {pastVisits.map((visit) => (
                          <div
                            key={visit.id}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
                          >
                            <div>
                              <p className='font-medium text-gray-900'>
                                {format(
                                  new Date(visit.visit_date),
                                  'MMMM dd, yyyy'
                                )}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {visit.visit_type}
                              </p>
                            </div>
                            {getStatusBadge(visit.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {visits.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      <Calendar className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                      <p>No visits scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* DOULA NOTES */}
              <Card className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg font-semibold text-gray-800'>
                      Doula Notes
                    </CardTitle>
                    <Badge variant='outline' className='bg-gray-50'>
                      {notes.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {notes.length > 0 ? (
                    <div className='space-y-4'>
                      {notes
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        )
                        .map((note) => (
                          <div
                            key={note.id}
                            className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50'
                          >
                            <div className='flex items-start justify-between mb-2'>
                              <div className='flex-1'>
                                <p className='text-sm text-gray-500 mb-1'>
                                  {format(
                                    new Date(note.created_at),
                                    'MMM dd, yyyy • h:mm a'
                                  )}
                                </p>
                                <p className='text-sm text-gray-700 line-clamp-2'>
                                  {note.content}
                                </p>
                              </div>
                              <div className='ml-4'>
                                {getStatusBadge(note.status)}
                              </div>
                            </div>
                            <Button variant='ghost' size='sm' className='mt-2'>
                              View Full Note
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      <MessageSquare className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                      <p>No notes yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - Activity Log */}
            <div className='space-y-6'>
              <Card className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                    <Activity className='h-5 w-5' />
                    Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLog.length > 0 ? (
                    <div className='space-y-3'>
                      {activityLog
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                        )
                        .map((activity) => (
                          <div
                            key={activity.id}
                            className='flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0'
                          >
                            <div className='flex-1'>
                              <p className='text-sm text-gray-900'>
                                {activity.action}
                              </p>
                              <p className='text-xs text-gray-500 mt-1'>
                                {format(
                                  new Date(activity.created_at),
                                  'MMM dd, yyyy • h:mm a'
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      <Activity className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                      <p>No activity yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Main>

      {/* Edit Doula Dialog */}
      {doula && (
        <EditDoulaDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          doula={doula}
          onUpdateSuccess={fetchDoulaData}
        />
      )}
    </>
  );
}
