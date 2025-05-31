import { Calendar, Clock, PlusCircle } from "lucide-react"; 
import { Label } from "@radix-ui/react-label";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { useState } from "react";
import { Card } from "@/common/components/ui/card";

interface PregnancyData {
    dueDate: string;
    currentWeek: number;
    lastAppointment: string;
    nextAppointment: string;
}

interface BirthPreferences {
    preference: string;
    type: string;
}

interface SupportTeam {
    name: string;
    role: string;
    contact: string;
}

interface OverviewLayoutProps {
  pregnancyData: PregnancyData[];
  birthPreferences: BirthPreferences[];
  supportTeam: SupportTeam[];
  newPreference: { preference: string; type: string };
  setNewPreference: (pref: { preference: string; type: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  newTeamMember: { name: string; role: string; contact: string };
  setNewTeamMember: (member: { name: string; role: string; contact: string }) => void;
  onTeamSubmit: (e: React.FormEvent) => void;
}

export default function OverviewLayout({ 
  pregnancyData, 
  birthPreferences, 
  supportTeam,
  newPreference,
  setNewPreference,
  onSubmit,
  newTeamMember,
  setNewTeamMember,
  onTeamSubmit
}: OverviewLayoutProps) {
  const [showForm, setShowForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="text-primary" size={20} />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">{pregnancyData[0].dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Week {pregnancyData[0].currentWeek}</p>
                <p className="text-sm text-muted-foreground">of 40</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-muted/50 rounded-lg">
              <Clock className="text-primary mr-3" size={20} />
              <div>
                <p className="text-sm font-medium">Next Appointment</p>
                <p className="text-sm text-muted-foreground">{pregnancyData[0].nextAppointment}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Birth Preferences</h3>
          <div className="space-y-3">
            {birthPreferences.map((pref, index) => (
              <div key={index} className="flex items-start">
                <div className={`min-w-2 h-2 rounded-full mt-2 mr-3 ${
                  pref.type === 'primary' ? 'bg-primary' :
                  pref.type === 'environment' ? 'bg-green-500' :
                  pref.type === 'medical' ? 'bg-destructive' : 'bg-purple-500'
                }`}></div>
                <div>
                  <p className="text-sm">{pref.preference}</p>
                  <p className="text-xs text-muted-foreground capitalize">{pref.type}</p>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="text-primary text-sm hover:text-primary/80 flex items-center mt-2"
            >
              <PlusCircle size={14} className="mr-1" />
              Add birth preference
            </button>
            
            {showForm && (
              <div className="mt-4 pt-4 border-t border-border">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preference">Birth Preference</Label>
                    <Input
                      id="preference"
                      value={newPreference.preference}
                      onChange={(e) => setNewPreference({ ...newPreference, preference: e.target.value })}
                      placeholder="Enter birth preference"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={newPreference.type}
                      onChange={(e) => setNewPreference({ ...newPreference, type: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="primary">Primary</option>
                      <option value="environment">Environment</option>
                      <option value="medical">Medical</option>
                      <option value="postpartum">Postpartum</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">Add Preference</Button>
                </form>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Support Team</h3>
        <div className="space-y-4">
          {supportTeam.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-input rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium text-sm">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
              <p className="text-xs text-primary">{member.contact}</p>
            </div>
          ))}
          <button 
            onClick={() => setShowTeamForm(!showTeamForm)}
            className="text-primary text-sm hover:text-primary/80 flex items-center"
          >
            <PlusCircle size={14} className="mr-1" />
            Add team member
          </button>
          
          {showTeamForm && (
            <div className="mt-4 pt-4 border-t border-border">
              <form onSubmit={onTeamSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                    placeholder="Enter name"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={newTeamMember.role}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                    placeholder="Enter role"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={newTeamMember.contact}
                    onChange={(e) => setNewTeamMember({ ...newTeamMember, contact: e.target.value })}
                    placeholder="Enter contact information"
                    className="h-8"
                  />
                </div>
                <Button type="submit" className="w-full">Add Team Member</Button>
              </form>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}