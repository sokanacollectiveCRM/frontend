import { useState, useEffect } from 'react'
import { Search, UserPlus, Download, Mail, Phone, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/common/components/ui/card'
import { Input } from '@/common/components/ui/input'
import { Button } from '@/common/components/ui/button'
import { Avatar, AvatarFallback } from '@/common/components/ui/avatar'
import { Badge } from '@/common/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/common/components/ui/dropdown-menu'

interface TeamMember {
  firstname: string
  lastname: string
  role: string
  email: string
}

export default function Teams() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTeam = async () => {
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
        email: member.email
      }))
      setTeamMembers(teamMemberData)
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = searchQuery 
    ? teamMembers.filter(member => 
        `${member.firstname} ${member.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teamMembers

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ]
    
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return colors[charCodeSum % colors.length]
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
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
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Invite</span>
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-48"></div>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => {
            const avatarClass = getAvatarColor(`${member.firstname} ${member.lastname}`)
            
            return (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-all border border-gray-200">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className={`h-12 w-12 ${avatarClass}`}>
                    <AvatarFallback>
                      {getInitials(member.firstname, member.lastname)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <CardTitle className="text-lg">
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
                      <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Mail className="mr-2 h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Phone className="mr-2 h-4 w-4" />
                      <span className="text-gray-400 italic">No phone listed</span>
                    </div>
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
  )
}