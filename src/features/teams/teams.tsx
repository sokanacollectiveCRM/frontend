import { useState, useEffect } from 'react'
import { Search, UserPlus, Download, Mail, Phone, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/common/components/ui/card'
import { Input } from '@/common/components/ui/input'
import { Button } from '@/common/components/ui/button'
import {Avatar, AvatarFallback } from '@/common/components/ui/avatar'
import UserAvatar from '@/common/components/user/UserAvatar'
import { Badge } from '@/common/components/ui/badge'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/common/components/ui/dropdown-menu'
import { Label } from '@/common/components/ui/label'

interface TeamMember { //Team member interface
  id: string,
  firstname: string,
  lastname: string,
  role: string,
  email: string,
  bio: string
}


const rand:number = Math.floor(Math.random() * 4)


export default function Teams() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]) //Team members state
  const [isLoading, setIsLoading] = useState(true) //Loading state
  const [searchQuery, setSearchQuery] = useState('') //Search query state
  const [inviteForm, setInviteForm] = useState({ //Invite form data state
    email: '',
    firstname: '',
    lastname: '',
    role: 'doula',
  })

  const fetchTeam = async () => { //function to fetch all team members
    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients/team`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch team members')
      }

      const data = await response.json()
      const teamMemberData = data.map((member: any) => ({
        firstname: member.firstname,
        lastname: member.lastname,
        role: member.role,
        email: member.email,
        id: member.id,
        bio: member.bio
      }))
      setTeamMembers(teamMemberData)
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = searchQuery  //function to use search query to get the desired team member
    ? teamMembers.filter(member => 
        `${member.firstname} ${member.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teamMembers

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { //handles change of search
    setSearchQuery(e.target.value)
  }



  const deleteMember = async (memberId: string) => { // function to delete member by ID
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No auth token found')
      return
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete member')
      }

      fetchTeam()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  


  const handleInviteSubmit = async (e: React.FormEvent) => {  //Function to handle click of invite team member button on teams page
    e.preventDefault()
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients/team/add`, { //create new user in users table to allow them to sign in
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstname: `${inviteForm.firstname}`,
          lastname: `${inviteForm.lastname}`,
          email: `${inviteForm.email}`,
          role: `${inviteForm.role}`,
        })
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invite team member');
      }

      const emailResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/email/team-invite`, { //send the email invite after user is created
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: inviteForm.email,
          firstname: inviteForm.firstname,
          lastname: inviteForm.lastname,
          role: inviteForm.role
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Failed to send invite email:', errorData);
        throw new Error(errorData.error || 'Failed to send invite email');
      }

      fetchTeam(); //Refresh to include new team & clear invite form
      setInviteForm({
        email: '',
        firstname: '',
        lastname: '',
        role: 'doula'
      });
    } catch (error) {
      console.error('Error inviting team member:', error);
    }
  }


  




  

  useEffect(() => {
    fetchTeam()
  }, [])

  return (
    <div className="min-h-screen w-full space-y-8">
      <div className="p-6 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search members..." 
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus size={16} />
                  <span>Invite</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First Name</Label>
                    <Input
                      id="firstname"
                      type="text"
                      placeholder="Enter first name"
                      value={inviteForm.firstname}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, firstname: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last Name</Label>
                    <Input
                      id="lastname"
                      type="text"
                      placeholder="Enter last name"
                      value={inviteForm.lastname}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, lastname: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="doula">Doula</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Send Invite
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" className="flex items-center gap-2" >
              <Download size={16} />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-48"></div>
            ))}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full h-full">
            {filteredMembers.map((member, index) => {
              return (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-all border border-gray-200 w-350 flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <UserAvatar 
                                  fullName={`${member?.firstname || ''} ${member?.lastname || ''}`} 
                                  className={'h-12 w-12'}
                                />
                    <div className="flex-1 w-full">
                      <CardTitle className="text-lg w-full">
                        {member.firstname} {member.lastname}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 font-normal">
                        {member.role}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteMember(member.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  
                  <CardContent className="pt-2 flex-grow">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Mail className="mr-2 h-4 w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Phone className="mr-2 h-4 w-4" />
                        <span className="text-gray-400 italic">No phone listed</span>
                      </div>
                      {member.bio && (
                        <div className="text-gray-500 mt-2">
                          <p className="text-sm line-clamp-2">{member.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">No team members found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Add team members to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}