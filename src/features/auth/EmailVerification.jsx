import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';


const VerificationPage = styled.div`
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-top: 100px;
`;

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (success) {
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } else if (error) {
      setStatus('error');
    }
  }, [searchParams, navigate]);

  return (
    <VerificationPage>
      {status === 'checking' && <h1>Checking verification status...</h1>}
      {status === 'success' && (
        <>
          <h1>Email Verified!</h1>
          <h2>{"You'll be redirected to login in 3 seconds..."}</h2>
        </>
      )}
      {status === 'error' && (
        <>
          <h1>Verification Failed</h1>
          <h2>Please try signing up again or contact support.</h2>
        </>
      )}
    </VerificationPage>
  );
}
