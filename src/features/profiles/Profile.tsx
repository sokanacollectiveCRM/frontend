import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { Badge } from '@/common/components/ui/badge';
import { Card } from '@/common/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/common/components/ui/tabs';
import UserAvatar from '@/common/components/user/UserAvatar';
import updateClientStatus from '@/common/utils/updateClientStatus';
import { useClientProfileData } from '@/features/profiles/hooks/useClientProfileData';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'sonner';
import { STATUS_LABELS, userStatusSchema } from '../clients/data/schema';
import ClientInfo from "./ClientInfo";
import Documents from "./Documents";
import Appointments from "./Notes";
import OverviewLayout from "./OverviewLayout";
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  FolderArchive, 
  Activity, 
  UserCircle2,
  Calendar
} from "lucide-react";
import { Button } from '@/common/components/ui/button';
import TimeTab from './TimeTab';

interface Note {
  id: number;
  text: string;
  date: string;
  category: string;
}

const statusOptions = userStatusSchema.options;

const tabs = [
  { name: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { name: "Notes", icon: <FileText className="w-4 h-4" /> },
  { name: "Time", icon: <Clock className="w-4 h-4" /> },
  { name: "Paperwork", icon: <FolderArchive className="w-4 h-4" /> },
  { name: "Activity", icon: <Activity className="w-4 h-4" /> },
  { name: "Client Info", icon: <UserCircle2 className="w-4 h-4" /> }
];

export default function Profile() {
  const { clientId } = useParams();
  const { client, loading, error } = useClientProfileData(clientId || '');

  const [tab, setTab] = useState('Overview');
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [paymentFiles, setPaymentFiles] = useState<File[]>([]);

  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Client requested lactation support resources and referrals", date: "Apr 22, 2025", category: "support" },
    { id: 2, text: "Discussed different baby formula options based on baby's sensitivity", date: "Apr 18, 2025", category: "nutrition" }
  ]);
  const [newNote, setNewNote] = useState("");
  const [noteCategory, setNoteCategory] = useState("general");
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [birthPreferences,SetBirthPreference] = useState([
    { preference: "Natural birth with minimal interventions", type: "primary" },
    { preference: "Dim lighting and calming music", type: "environment" },
    { preference: "Delayed cord clamping", type: "medical" },
    { preference: "Immediate skin-to-skin contact", type: "postpartum" }
  ])

  const [newPreference, setNewPreference] = useState({
    preference: '',
    type: 'primary'
  });

  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    contact: ''
  });

  const HandleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    SetBirthPreference([...birthPreferences, newPreference]);
    setNewPreference({ preference: '', type: 'primary' });
  }

  const HandleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportTeam([...supportTeam, newTeamMember]);
    setNewTeamMember({ name: '', role: '', contact: '' });
  }

  const [supportTeam, setSupportTeam] = useState([
    { name: "Dr. Sarah Johnson", role: "OB/GYN", contact: "555-123-4567" },
    { name: "Midwife Center", role: "Backup Midwifery", contact: "555-987-6543" },
    { name: "John Smith", role: "Partner/Birth Support", contact: "555-345-6789" }
  ]);

  const handleStatusChange = async (newStatus: string) => {
    if (!clientId) return;

    try {
      await updateClientStatus(clientId, newStatus);
      toast.success('Successfully updated client status');
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update client status...');
    }
  }

  const pregnancyData = [{
    dueDate: "June 15, 2025",
    currentWeek: 28,
    lastAppointment: "April 18, 2025",
    nextAppointment: "May 2, 2025"
  }];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!client || loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const renderTabContent = () => {
    switch (tab) {
      case 'Overview':
        return (
          <OverviewLayout 
            pregnancyData={pregnancyData} 
            birthPreferences={birthPreferences} 
            supportTeam={supportTeam}
            newPreference={newPreference}
            setNewPreference={setNewPreference}
            onSubmit={HandleBirthSubmit}
            newTeamMember={newTeamMember}
            setNewTeamMember={setNewTeamMember}
            onTeamSubmit={HandleTeamSubmit}
          />
        );
      case 'Notes':
        return (
          <Appointments
            notes={notes}
            setNotes={setNotes}
            newNote={newNote}
            setNewNote={setNewNote}
            noteCategory={noteCategory}
            setNoteCategory={setNoteCategory}
            showAddNote={showAddNote}
            setShowAddNote={setShowAddNote}
            editingNoteId={editingNoteId}
            setEditingNoteId={setEditingNoteId}
            editText={editText}
            setEditText={setEditText}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
          />
        );
      case 'Time':
        return <TimeTab />;
      case 'Paperwork':
        return (
          <Documents
            formFiles={formFiles}
            setFormFiles={setFormFiles}
            invoiceFiles={invoiceFiles}
            setInvoiceFiles={setInvoiceFiles}
            contractFiles={contractFiles}
            setContractFiles={setContractFiles}
            paymentFiles={paymentFiles}
            setPaymentFiles={setPaymentFiles}
          />
        );
      case 'Activity':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Pregnancy Timeline</h3>
              </div>
              <div className="space-y-6">
                {[
                  {
                    date: "May 2, 2025",
                    title: "First Trimester Complete",
                    description: "Completed first trimester with healthy progress",
                    type: "milestone",
                    icon: <Activity className="w-4 h-4 text-primary" />,
                  },
                  {
                    date: "Apr 15, 2025",
                    title: "Anatomy Scan",
                    description: "20-week anatomy scan completed successfully",
                    type: "appointment",
                    icon: <Calendar className="w-4 h-4 text-primary" />,
                  },
                  {
                    date: "Mar 1, 2025",
                    title: "First Prenatal Visit",
                    description: "Initial consultation and health assessment",
                    type: "appointment",
                    icon: <Calendar className="w-4 h-4 text-primary" />,
                  },
                  {
                    date: "Feb 15, 2025",
                    title: "Positive Pregnancy Test",
                    description: "Confirmed pregnancy with healthcare provider",
                    type: "milestone",
                    icon: <Activity className="w-4 h-4 text-primary" />,
                  }
                ].map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {event.icon}
                      </div>
                      {index !== 3 && (
                        <div className="w-0.5 h-full bg-muted my-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Client Info':
        return <ClientInfo client={client} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6 gap-6">
      <Card className="w-[400px] p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-2 items-center">
          <UserAvatar
            profile_picture={client.user.profile_picture}
            fullName={`${client.user.firstname} ${client.user.lastname}`}
            large={true}
            className="mb-2"
          />
          <h2 className="text-4xl font-bold text-gray-800">{client.user.firstname} {client.user.lastname}</h2>
          <p className="text-sm text-gray-500">Expecting mother • {pregnancyData[0].currentWeek} weeks</p>

          <div className="ml-5 mt-6 w-full">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Client Details</h3>

            <div className="grid grid-cols-[max-content_1fr] gap-y-5 gap-x-10 text-[15px] w-full">
              <p className="text-gray-500 text-left">Email</p>
              <p className="text-left break-words text-gray-800">{client.user.email}</p>

              <p className="text-gray-500 text-left">Phone number</p>
              <p className="text-left text-gray-800">(630) 785-8457</p>

              <p className="text-gray-500 text-left">Date of birth</p>
              <p className="text-left text-gray-800">08/09/1992</p>

              <p className="text-gray-500 text-left">Address</p>
              <p className="text-left break-words text-gray-800">845 Lincoln, Evanston</p>

              <p className="text-gray-500 text-left">Due Date</p>
              <p className="text-left text-gray-800">{pregnancyData[0].dueDate}</p>

              <p className="text-gray-500 text-left">Services Needed</p>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">
                {client.serviceNeeded || 'Not specified'}
              </Badge>

              <p className="text-gray-500 text-left">Status</p>
              <Select defaultValue={client.status} onValueChange={handleStatusChange}>
                <SelectTrigger className={cn('w-[150px] mt-[-5px]')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {STATUS_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <main className="flex-1 p-6 bg-white rounded-2xl shadow-sm flex flex-col max-h-[calc(100vh-3rem)] overflow-hidden">
        <div className="flex gap-6 mb-6 border-b border-gray-200 pb-2">
          {tabs.map(({ name, icon }) => (
            <button 
              key={name} 
              onClick={() => setTab(name)}
              className={`flex items-center gap-2 w-1/6 text-sm font-semibold pb-2 transition-colors duration-200 ${
                tab === name 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
            >
              {icon}
              {name}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode='wait'>
            <motion.div
              key={tab}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
