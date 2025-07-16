import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";

import { AlertCircle, Award, Baby, Book, Heart, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";

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
  const { clientId } = useParams();

  const addNote = async (): Promise<void> => {
    if (newNote.trim()) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newNoteObj = { id: Date.now(), text: newNote, date: dateStr, category: noteCategory };

      setNotes([...notes, newNoteObj]);
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
    switch (category) {
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
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Notes</h3>
          <Button
            onClick={() => setShowAddNote(!showAddNote)}
            variant="outline"
            className="text-primary border-primary/20 hover:bg-primary/10"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Note
          </Button>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 border border-input rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {note.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{note.date}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingNoteId(note.id);
                      setEditText(note.text);
                      setEditCategory(note.category);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <p className="text-sm">{note.text}</p>
            </div>
          ))}
        </div>

        {showAddNote && (
          <div className="mt-6 p-4 border border-input rounded-lg">
            <h4 className="text-sm font-medium mb-4">Add New Note</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-text">Note</Label>
                <Textarea
                  id="note-text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your note here..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="note-category">Category</Label>
                <Select value={noteCategory} onValueChange={setNoteCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddNote(false)}
                  className="text-muted-foreground hover:text-primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (newNote.trim()) {
                      setNotes([
                        ...notes,
                        {
                          id: Date.now(),
                          text: newNote,
                          date: new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }),
                          category: noteCategory
                        }
                      ]);
                      setNewNote('');
                      setNoteCategory('general');
                      setShowAddNote(false);
                    }
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {editingNoteId !== null && (
          <div className="mt-6 p-4 border border-input rounded-lg">
            <h4 className="text-sm font-medium mb-4">Edit Note</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-note-text">Note</Label>
                <Textarea
                  id="edit-note-text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-note-category">Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingNoteId(null);
                    setEditText('');
                    setEditCategory('');
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setNotes(notes.map(note =>
                      note.id === editingNoteId
                        ? { ...note, text: editText, category: editCategory }
                        : note
                    ));
                    setEditingNoteId(null);
                    setEditText('');
                    setEditCategory('');
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}