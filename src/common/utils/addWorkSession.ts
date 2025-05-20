import { useEffect, useState } from "react"

export default async function addWorkSession(doula_id: string | undefined, client_id: string | undefined, start_time: Date | undefined, end_time: Date | undefined) {

  if(!doula_id || !client_id ||  !start_time || !end_time) {
    return;
  }

  async function addSession() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/users/${doula_id}/addhours`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doula_id: doula_id,
          client_id: client_id,
          start_time: start_time,
          end_time: end_time
        })
      });
      
      if(!response.ok) {
        throw new Error(`Could not create new work session: ${response.status}`);
      }
    } catch(error) {
      console.error('Error trying to add work session:', error);
    } 
  }
  addSession();
}