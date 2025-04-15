import { useState } from 'react';

import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { useUser } from '@/common/hooks/useUser';

const Container = styled.div`
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: #ffe6e6;
`;

const SuccessMessage = styled.div`
  color: #2e7d32;
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: #edf7ed;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  text-align: center;
  margin-top: 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 20px;
`;

export default function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Reset Password</Title>
      {!success ? (
        <Form onSubmit={handleSubmit}>
          <Input
            type='email'
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Reset Password'}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <StyledLink to='/login'>Back to Login</StyledLink>
        </Form>
      ) : (
        <div>
          <SuccessMessage>
            Password reset instructions have been sent to your email. Please
            check your inbox and follow the instructions to reset your password.
            If you don&apos;t receive the email within a few minutes, please
            check your spam folder.
          </SuccessMessage>
          <StyledLink to='/login'>Back to Login</StyledLink>
        </div>
      )}
    </Container>
  );
}
