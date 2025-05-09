import { useLocation } from "react-router-dom";
import { useState } from "react";
import OverviewLayout from "./OverviewLayout";
import Appointments from "./Notes";
import ClientInfo from "./ClientInfo";
import Documents from "./Documents";
interface Note {
  id: number;
  text: string;
  date: string;
  category: string;
}



export default function Profile() {

  
  const location = useLocation();
  const user = (location.state)?.user;
  
  const [tab, setActiveTab] = useState<string>("Overview");

  
  
  const [pregnancyData, setPregnancyData] = useState([{
    dueDate: "June 15, 2025",
    currentWeek: 28,
    lastAppointment: "April 18, 2025",
    nextAppointment: "May 2, 2025"
  }]);

  const [birthPreferences, setBirthPreferences] = useState([
    { preference: "Natural birth with minimal interventions", type: "primary" },
    { preference: "Dim lighting and calming music", type: "environment" },
    { preference: "Delayed cord clamping", type: "medical" },
    { preference: "Immediate skin-to-skin contact", type: "postpartum" }
  ]);

  const [notes, setNotes] = useState<Note[]>([
    { id: 1, text: "Client requested lactation support resources and referrals", date: "Apr 22, 2025", category: "support" },
    { id: 2, text: "Discussed different baby formula options based on baby's sensitivity", date: "Apr 18, 2025", category: "nutrition" }
  ]);






  const [newNote, setNewNote] = useState<string>("");
  const [noteCategory, setNoteCategory] = useState<string>("general");
  
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");








  const [supportTeam, setSupportTeam] = useState([
    { name: "Dr. Sarah Johnson", role: "OB/GYN", contact: "555-123-4567" },
    { name: "Midwife Center", role: "Backup Midwifery", contact: "555-987-6543" },
    { name: "John Smith", role: "Partner/Birth Support", contact: "555-345-6789" }
  ]);






const [files, setFiles] = useState<File[]>([]);



  

  if (!user) {
    return <div>No Data Here!</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <div className="w-1/4 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col items-center text-center">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="rounded-full w-24 h-24 mb-4 object-cover border-4 border-indigo-100"
          />
          <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-indigo-600 text-sm mb-4">Expecting mother • {pregnancyData[0].currentWeek} weeks</p>

          <div className="text-left w-full space-y-3 text-sm">
            <p><strong>Email:</strong> {user.firstName}{user.lastName}@gmail.com</p>
            <p><strong>Phone:</strong> (630) 785-8457</p>
            <p><strong>Date of Birth:</strong> 08/09/1992</p>
            <p><strong>Address:</strong> 845 Lincoln, Evanston</p>
            <p><strong>Due Date:</strong> {pregnancyData[0].dueDate}</p>
            <p><strong>Contract Type:</strong> {user.contractType}</p>
            <p><strong>Status:</strong> <span className="text-green-600 font-medium">{user.status}</span></p>
          </div>
        </div>
      </div>


      <div className="flex-1 p-6">
        <div className="flex gap-6 mb-6 border-b border-gray-200 pb-2">
          {["Overview", "Notes", "Time", "Paperwork", "Activity", "Client Info"].map((tabName) => (
            <button 
              key={tabName} 
              onClick={() => setActiveTab(tabName)}
              className={` w-1/6 text-sm font-semibold pb-2 ${tab === tabName ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
            >
              {tabName}
            </button>
          ))}
        </div>
        
         
        
        {tab === 'Notes' && (
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
        )}
        {tab === 'Overview' && OverviewLayout(pregnancyData, birthPreferences, supportTeam)}

        {tab === 'Client Info' && ClientInfo(user)}

        {tab == 'Paperwork' && <Documents files={files} setFiles={setFiles}/>}
      </div>
    </div>
  );
}
  
          
      
