// wait i think useClients already implements what I want

// import { useEffect, useState } from 'react';
// import { User } from "@/common/types/user.ts"

// export default function useGetMyClients(doulaId?: string) {
//   const [users, setUsers] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
  
//   useEffect(() => {
//     if (!doulaId) {
//       setIsLoading(false);
//       return;
//     }
    
//     async function getClients() {
//       try {
//         const token = localStorage.getItem('authToken');
        
//         if (!token) {
//           throw new Error('Not authenticated');
//         }
        
//         const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/clients`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
        
//         if (!response.ok) {
//           throw new Error(`Error fetching work logs: ${response.status}`);
//         }
        
//         const data = await response.json();
//         setHours(data);
//       } catch (error) {
//         console.error('Error fetching work logs:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
    
//     fetchWorkLog();
//   }, [userId]);
  
//   return { hours, isLoading };
// }