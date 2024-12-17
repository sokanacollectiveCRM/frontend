// AuthCallback.js
import React, { useContext, useEffect } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { UserContext } from 'common/contexts/UserContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Authentication error:', error);
        navigate('/login');
        return;
      }

      if (!accessToken) {
        console.error('No access token received');
        navigate('/login');
        return;
      }

      localStorage.setItem('access_token', accessToken);

      try {
        const response = await fetch('http://localhost:5050/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          navigate('/', { replace: true });
        } else {
          throw new Error('Failed to get user details');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser, searchParams]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h2 className='text-xl font-semibold mb-4'>Verifying your account...</h2>
      <p>Please wait while we complete the verification process.</p>
    </div>
  );
}
