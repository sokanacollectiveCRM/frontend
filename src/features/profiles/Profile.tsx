import { Card } from "@/common/components/ui/card";
import { AlertCircle, Award, Baby, Book, Calendar, Check, Clock, Edit2, Heart, PlusCircle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

// FIX TYPESCRIPT ERRORS
// CHANGE THE USE STATE SPAM WHEN REAL DATA IS USED-- Use objects
export default function Profile() {
    const location = useLocation();
    const user = location.state?.user;
    
    const [notes, setNotes] = useState([
      { id: 1, text: "Client requested lactation support resources and referrals", date: "Apr 22, 2025", category: "support" },
      { id: 2, text: "Discussed different baby formula options based on baby's sensitivity", date: "Apr 18, 2025", category: "nutrition" }
    ]);
    const [newNote, setNewNote] = useState("");
    const [noteCategory, setNoteCategory] = useState("general");
    const [showAddNote, setShowAddNote] = useState(false);

    
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [editCategory, setEditCategory] = useState("");

    const [pregnancyData, setPregnancyData] = useState({
      dueDate: "June 15, 2025",
      currentWeek: 28,
      lastAppointment: "April 18, 2025",
      nextAppointment: "May 2, 2025"
    });

    const [birthPreferences, setBirthPreferences] = useState([
      { preference: "Natural birth with minimal interventions", type: "primary" },
      { preference: "Dim lighting and calming music", type: "environment" },
      { preference: "Delayed cord clamping", type: "medical" },
      { preference: "Immediate skin-to-skin contact", type: "postpartum" }
    ]);

    const [supportTeam, setSupportTeam] = useState([
      { name: "Dr. Sarah Johnson", role: "OB/GYN", contact: "555-123-4567" },
      { name: "Midwife Center", role: "Backup Midwifery", contact: "555-987-6543" },
      { name: "John Smith", role: "Partner/Birth Support", contact: "555-345-6789" }
    ]);
  
    const addNote = () => {
      if (newNote.trim()) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        setNotes([...notes, { id: Date.now(), text: newNote, date: dateStr, category: noteCategory }]);
        setNewNote("");
        setNoteCategory("general");
        setShowAddNote(false);
      }
    };
  
    const deleteNote = (id : any) => {
      setNotes(notes.filter(note => note.id !== id));
    };
  
    const startEdit = (note: { id: number, text: string, category: string} ) => {
      setEditingNoteId(note.id);
      setEditText(note.text);
      setEditCategory(note.category);
    };
  
    const saveEdit = () => {
      if (editText.trim()) {
        setNotes(notes.map(note => 
          note.id === editingNoteId ? { ...note, text: editText, category: editCategory } : note
        ));
      }
      setEditingNoteId(null);
    };
  
    const cancelEdit = () => {
      setEditingNoteId(null);
    };

    const getCategoryColor = (category: string) => {
      const colors = {
        general: "bg-gray-100 text-gray-800",
        support: "bg-blue-100 text-blue-800",
        nutrition: "bg-green-100 text-green-800",
        medical: "bg-red-100 text-red-800",
        birth: "bg-purple-100 text-purple-800",
        postpartum: "bg-pink-100 text-pink-800"
      };
      return colors[category as keyof typeof colors] || colors.general;
    };

    const getCategoryIcon = (category: string) => {
      switch(category) {
        case "support": return <Heart size={12} className="mr-1" />;
        case "nutrition": return <Award size={12} className="mr-1" />;
        case "medical": return <AlertCircle size={12} className="mr-1" />;
        case "birth": return <Baby size={12} className="mr-1" />;
        case "postpartum": return <Book size={12} className="mr-1" />;
        default: return null;
      }
    };
  
    if (!user) {
      return <div>No Data Here!</div>;
    }
  
    return (
      <div className="flex min-h-screen bg-gray-50 p-6">
        <div className="w-1/3 bg-white p-6 rounded-2xl shadow-md">
          <div className="flex flex-col items-center text-center">
            <img
              src="https://via.placeholder.com/100"
              alt="Profile"
              className="rounded-full w-24 h-24 mb-4 object-cover border-4 border-indigo-100"
            />
            <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-indigo-600 text-sm mb-4">Expecting mother • {pregnancyData.currentWeek} weeks</p>
  
            <div className="text-left w-full space-y-3 text-sm">
              <p><strong>Email:</strong> {user.firstName}{user.lastName}@gmail.com</p>
              <p><strong>Phone:</strong> (630) 785-8457</p>
              <p><strong>Date of Birth:</strong> 08/09/1992</p>
              <p><strong>Address:</strong> 845 Lincoln, Evanston</p>
              <p><strong>Due Date:</strong> {pregnancyData.dueDate}</p>
              <p><strong>Contract Type:</strong> {user.contractType}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-medium">{user.status}</span></p>
            </div>
  
            <div className="mt-6 w-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">Client Notes</h3>
                <button 
                  onClick={() => setShowAddNote(!showAddNote)} 
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add note
                </button>
              </div>
              
              {showAddNote && (
                <div className="mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Type your note here..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      className="text-xs border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="general">General</option>
                      <option value="support">Support</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="medical">Medical</option>
                      <option value="birth">Birth</option>
                      <option value="postpartum">Postpartum</option>
                    </select>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowAddNote(false)}
                        className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={addNote}
                        className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 overflow-visible">
              {notes.map((note) => (
                  <Card key={note.id} className="p-3 bg-white text-gray-700 text-xs border border-gray-200 hover:shadow-md transition-shadow">
                    {editingNoteId === note.id ? (
                      <>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="text-xs border border-gray-300 rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="general">General</option>
                            <option value="support">Support</option>
                            <option value="nutrition">Nutrition</option>
                            <option value="medical">Medical</option>
                            <option value="birth">Birth</option>
                            <option value="postpartum">Postpartum</option>
                          </select>
                          <div className="flex space-x-2">
                            <button 
                              onClick={cancelEdit}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <X size={16} />
                            </button>
                            <button 
                              onClick={saveEdit}
                              className="p-1 text-green-500 hover:text-green-700"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="text-indigo-600 font-medium">{note.date}</span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full flex items-center ${getCategoryColor(note.category)}`}>
                              {getCategoryIcon(note.category)}
                              {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => startEdit(note)}
                              className="p-1 text-gray-500 hover:text-indigo-600"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => deleteNote(note.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-800 text-sm">{note.text}</p>
                      </>
                    )}
                  </Card>
                ))}
  
                {notes.length === 0 && (
                  <div className="text-center py-6 text-gray-500 italic text-sm border border-dashed border-gray-300 rounded-lg">
                    No notes available. Click "Add note" to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  
        <div className="flex-1 p-6">
          <div className="flex gap-6 mb-6 border-b border-gray-200 pb-2">
            {["Overview", "Birth Plan", "Appointments", "Billing", "Notes", "Documents", "Resources"].map((tab, index) => (
              <button 
                key={tab} 
                className={`text-sm font-semibold pb-2 ${index === 0 ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
  
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Pregnancy Timeline</h3>
              <span className="text-sm text-indigo-600">Week {pregnancyData.currentWeek} of 40</span>
            </div>
            
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full w-full mb-6">
                <div 
                  className="h-2 bg-indigo-600 rounded-full" 
                  style={{ width: `${(pregnancyData.currentWeek / 40) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>First Trimester</span>
                <span>Second Trimester</span>
                <span>Third Trimester</span>
                <span>Due Date</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Calendar className="text-blue-600 mr-2" size={20} />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Due Date</p>
                  <p className="text-sm">{pregnancyData.dueDate}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Clock className="text-green-600 mr-2" size={20} />
                <div>
                  <p className="text-xs text-green-600 font-medium">Next Appointment</p>
                  <p className="text-sm">{pregnancyData.nextAppointment}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <h3 className="text-md font-semibold mb-4">Birth Preferences</h3>
            <div className="space-y-3">
              {birthPreferences.map((pref, index) => (
                <div key={index} className="flex items-start">
                  <div className={`min-w-2 h-2 rounded-full mt-2 mr-3 ${
                    pref.type === 'primary' ? 'bg-indigo-600' :
                    pref.type === 'environment' ? 'bg-green-500' :
                    pref.type === 'medical' ? 'bg-red-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-sm">{pref.preference}</p>
                    <p className="text-xs text-gray-500 capitalize">{pref.type}</p>
                  </div>
                </div>
              ))}
              <button className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center mt-2">
                <PlusCircle size={14} className="mr-1" />
                Add birth preference
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <h3 className="text-md font-semibold mb-4">Support Team</h3>
            <div className="space-y-4">
              {supportTeam.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  <p className="text-xs text-indigo-600">{member.contact}</p>
                </div>
              ))}
              <button className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center">
                <PlusCircle size={14} className="mr-1" />
                Add team member
              </button>
            </div>
          </div>
          
        </div>
  

      </div>
    );
}