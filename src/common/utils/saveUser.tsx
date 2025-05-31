export default async function saveUser(userData: FormData) {

  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/users/update`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: userData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save user");
    }
    return await response.json();
  } catch (error) {
    console.error("Error: couldn't save user", error);
    throw (error);
  }
}