import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Heart, Award, AlertCircle, Baby, Book, PlusCircle, X, Check, Edit2, Trash2 } from "lucide-react";

interface Note {
  id: number;
  text: string;
  date: string;
  category: string;
}

interface AppointmentsProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  newNote: string;
  setNewNote: React.Dispatch<React.SetStateAction<string>>;
  noteCategory: string;
  setNoteCategory: React.Dispatch<React.SetStateAction<string>>;
  showAddNote: boolean;
  setShowAddNote: React.Dispatch<React.SetStateAction<boolean>>;
  editingNoteId: number | null;
  setEditingNoteId: React.Dispatch<React.SetStateAction<number | null>>;
  editText: string;
  setEditText: React.Dispatch<React.SetStateAction<string>>;
  editCategory: string;
  setEditCategory: React.Dispatch<React.SetStateAction<string>>;
}



export default function Appointments({
  notes,
  setNotes,
  newNote,
  setNewNote,
  noteCategory,
  setNoteCategory,
  showAddNote,
  setShowAddNote,
  editingNoteId,
  setEditingNoteId,
  editText,
  setEditText,
  editCategory,
  setEditCategory
}: AppointmentsProps) {

  const addNote = (): void => {
    if (newNote.trim()) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setNotes([...notes, { id: Date.now(), text: newNote, date: dateStr, category: noteCategory }]);
      setNewNote("");
      setNoteCategory("general");
      setShowAddNote(false);
    }
  };

  const deleteNote = (id: number): void => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const startEdit = (note: Note): void => {
    setEditingNoteId(note.id);
    setEditText(note.text);
    setEditCategory(note.category);
  };

  const saveEdit = (): void => {
    if (editText.trim()) {
      setNotes(notes.map(note => 
        note.id === editingNoteId ? { ...note, text: editText, category: editCategory } : note
      ));
    }
    setEditingNoteId(null);
  };

  const cancelEdit = (): void => {
    setEditingNoteId(null);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-800",
      support: "bg-blue-100 text-blue-800",
      nutrition: "bg-green-100 text-green-800",
      medical: "bg-red-100 text-red-800",
      birth: "bg-purple-100 text-purple-800",
      postpartum: "bg-pink-100 text-pink-800"
    };
    return colors[category] || colors.general;
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by name..."
          className="max-w-sm"
        />
        <button 
          onClick={() => setShowAddNote(!showAddNote)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle size={16} className="mr-2" />
          Add Note
        </button>
      </div>

      {showAddNote && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
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
              className="text-sm border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={addNote}
                className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3">Client Notes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="overflow-visible">
            {editingNoteId === note.id ? (
              <CardContent className="p-4">
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
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-600 font-medium">{note.date}</span>
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
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center w-fit ${getCategoryColor(note.category)}`}>
                    {getCategoryIcon(note.category)}
                    {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 text-sm">{note.text}</p>
                </CardContent>
              </>
            )}
          </Card>
        ))}
        
        {notes.length === 0 && (
          <div className="col-span-full text-center py-6 text-gray-500 italic text-sm border border-dashed border-gray-300 rounded-lg">
            No notes available. Click "Add note" to create one.
          </div>
        )}
      </div>

     
    </div>
  );
}