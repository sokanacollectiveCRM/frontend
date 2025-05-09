import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { useUser } from '@/common/hooks/user/useUser';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors?.text || '#000'};
`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('AuthCallback mounted');
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');

        console.log('Token status:', access_token ? 'present' : 'missing');

        if (!access_token) {
          throw new Error('No access token received');
        }

        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/auth/callback`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Authentication failed');
        }

        localStorage.setItem('authToken', access_token);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const authSuccess = await checkAuth();
        if (authSuccess) {
          navigate('/', { replace: true });
        } else {
          throw new Error('Authentication verification failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', {
          state: { error: error instanceof Error ? error.message : error},
          replace: true,
        });
      }
    };

    handleCallback();
  }, [navigate, checkAuth]);

  return (
    <Container>
      <LoadingOverlay isLoading={true}/>
    </Container>
  );
}
