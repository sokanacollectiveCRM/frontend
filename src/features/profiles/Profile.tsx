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

interface Note {
  id: number;
  text: string;
  date: string;
  category: string;
}

const statusOptions = userStatusSchema.options;

const tabList = ["Overview", "Notes", "Time", "Paperwork", "Activity", "Client Info"];

export default function Profile() {
  const { clientId } = useParams();
  const { client, loading, error } = useClientProfileData(clientId || '');

  const [tab, setTab] = useState('Overview');

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
  const [files, setFiles] = useState<File[]>([]);

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

  const birthPreferences = [
    { preference: "Natural birth with minimal interventions", type: "primary" },
    { preference: "Dim lighting and calming music", type: "environment" },
    { preference: "Delayed cord clamping", type: "medical" },
    { preference: "Immediate skin-to-skin contact", type: "postpartum" }
  ];

  const supportTeam = [
    { name: "Dr. Sarah Johnson", role: "OB/GYN", contact: "555-123-4567" },
    { name: "Midwife Center", role: "Backup Midwifery", contact: "555-987-6543" },
    { name: "John Smith", role: "Partner/Birth Support", contact: "555-345-6789" }
  ];

  if (error) return <div>Error: {error}</div>;

  const renderTabContent = () => {
    switch (tab) {
      case 'Overview':
        return OverviewLayout(pregnancyData, birthPreferences, supportTeam);
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
        return <h1> Nothing to show here. </h1>
      case 'Paperwork':
        return <Documents files={files} setFiles={setFiles} />;
      case 'Activity':
        return <h1> Nothing to show here. </h1>
      case 'Client Info':
        return ClientInfo(client);
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6 gap-6">
      <LoadingOverlay isLoading={!client || loading} />
      <Card className="w-[400px] p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-2 items-center">
          <UserAvatar
            profile_picture={client?.user.profile_picture}
            fullName={`${client?.user.firstname} ${client?.user.lastname}`}
            large={true}
            className="mb-2"
          />
          <h2 className="text-4xl font-bold text-neutral-900">{client?.user.firstname} {client?.user.lastname}</h2>
          <p className="text-sm text-muted-foreground">Expecting mother • {pregnancyData[0].currentWeek} weeks</p>

          <div className="ml-5 mt-6 w-full">
            <h3 className="text-lg font-bold mb-3">Client Details</h3>

            <div className="grid grid-cols-[max-content_1fr] gap-y-5 gap-x-10 text-[15px] w-full">
              <p className="text-neutral-400 text-left">Email</p>
              <p className="text-left break-words">{client?.user.email}</p>

              <p className="text-neutral-400 text-left">Phone number</p>
              <p className="text-left">(630) 785-8457</p>

              <p className="text-neutral-400 text-left">Date of birth</p>
              <p className="text-left">08/09/1992</p>

              <p className="text-neutral-400 text-left">Address</p>
              <p className="text-left break-words">845 Lincoln, Evanston</p>

              <p className="text-neutral-400 text-left">Due Date</p>
              <p className="text-left">{pregnancyData[0].dueDate}</p>

              <p className="text-neutral-400 text-left">Services Needed</p>
              <Badge variant="outline"> {client?.serviceNeeded} </Badge>

              <p className="text-neutral-400 text-left">Status</p>
              <Select defaultValue={client?.status} onValueChange={handleStatusChange}>
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
      </Card >

      <main className="flex-1 p-6 bg-white rounded-2xl shadow-md flex flex-col max-h-[calc(100vh-3rem)] overflow-hidden">
        <Tabs value={tab} onValueChange={setTab} className="sticky z-10 bg-white mb-6">
          <TabsList className="flex w-full justify-between gap-4">
            {["Overview", "Notes", "Time", "Paperwork", "Activity", "Client Info"].map((tabName) => (
              <TabsTrigger
                key={tabName}
                value={tabName}
                className="w-full text-sm font-semibold pb-2"
              >
                {tabName}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
    </div >
  );
}
