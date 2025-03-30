import { Button } from '@/common/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/common/components/ui/table'; // Import ShadCN table components
import { H1 } from '@/common/components/ui/typography';
import { useEffect, useState } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients`,
          {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log(data);
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <H1> Clients </H1>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Contract</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((client) => (
            <TableRow>
              <TableCell>{client.firstName + client.lastName}</TableCell>
              <TableCell>{client.serviceNeeded}</TableCell>
              <TableCell>{client.requestedAt}</TableCell>
              <TableCell>{client.updatedAt}</TableCell>
              <TableCell>{client.status}</TableCell>
              <TableCell><Button > Accept </Button> </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersPage;