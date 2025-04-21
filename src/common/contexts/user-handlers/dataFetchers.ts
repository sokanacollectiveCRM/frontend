import { User } from '@/common/types/auth';

export function useUserDataFetcher(
  buildUrl: (url: string) => string,
) {

  //
  // getClients
  //
  // Grabs all clients designated to the user. If Doula => returns assigned Clients. If Admin => returns
  // all clients. If you're a client and somehow called this function => you won't get any response.
  //
  const getClients = async (): Promise<User[]>  => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(buildUrl('/clients'), {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Could not grab clients');
      
      const data = await response.json();
      return data as User[];
    }
    catch (err) {
      console.error(err instanceof Error ? err.message : 'Error grabbing clients');
      return [];
    }
  }

  return {
    getClients
  }
}