import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { useUser } from '@/common/hooks/user/useUser';
import { consumeSensitiveHash } from './consumeSensitiveHash';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = consumeSensitiveHash(window.location, window.history);
        const access_token = params.get('access_token');

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

        await new Promise((resolve) => setTimeout(resolve, 100));

        const authSuccess = await checkAuth();
        if (authSuccess) {
          navigate('/', { replace: true });
        } else {
          throw new Error('Authentication verification failed');
        }
      } catch (error) {
        navigate('/login', {
          state: { error: error instanceof Error ? error.message : error },
          replace: true,
        });
      }
    };

    handleCallback();
  }, [navigate, checkAuth]);

  return (
    <Container>
      <LoadingOverlay isLoading={true} />
    </Container>
  );
}
