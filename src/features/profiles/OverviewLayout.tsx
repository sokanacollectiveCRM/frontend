
import { Calendar, Clock, PlusCircle } from "lucide-react"; 


interface PregnancyData{
    dueDate: string;
    currentWeek: number;
    lastAppointment: string;
    nextAppointment: string;
}

interface BirthPreferences{
    preference: string;
    type: string;

}
interface SupportTeam{
    name: string;
    role: string;
    contact: string;

}


export default function OverviewLayout(pregnancyData:PregnancyData[], birthPreferences:BirthPreferences[], supportTeam:SupportTeam[]){
    return(
    <div>
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-semibold">Pregnancy Timeline</h3>
          <span className="text-sm text-indigo-600">Week {pregnancyData[0].currentWeek} of 40</span>
        </div>
        
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full w-full mb-6">
            <div 
              className="h-2 bg-indigo-600 rounded-full" 
              style={{ width: `${(pregnancyData[0].currentWeek / 40) * 100}%` }}
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
              <p className="text-sm">{pregnancyData[0].dueDate}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <Clock className="text-green-600 mr-2" size={20} />
            <div>
              <p className="text-xs text-green-600 font-medium">Next Appointment</p>
              <p className="text-sm">{pregnancyData[0].nextAppointment}</p>
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
    )
}