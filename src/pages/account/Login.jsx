import React, { useContext, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Form, FormTitle } from 'common/components/form/Form';
import { Input } from 'common/components/form/Input';
import SubmitButton from 'common/components/form/SubmitButton';
import { UserContext } from 'common/contexts/UserContext';

import { StyledPage } from './styles';

export default function LogIn() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  const handleChangeEmail = (e) => {
    setFormState({ ...formState, email: e.target.value });
    setError('');
  };

  const handleChangePassword = (e) => {
    setFormState({ ...formState, password: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.email,
            password: formState.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const userResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/me`,
        {
          credentials: 'include',
        }
      );

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledPage>
      <Form onSubmit={handleSubmit}>
        <FormTitle>Log In</FormTitle>
        {error && <div className='text-red-500 mb-4'>{error}</div>}
        <Input.Text
          title='Email'
          placeholder='j@example.com'
          value={formState.email}
          handleChange={handleChangeEmail}
          required
        />
        <Input.Password
          title='Password'
          value={formState.password}
          handleChange={handleChangePassword}
          required
        />
        <SubmitButton onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </SubmitButton>
      </Form>
    </StyledPage>
  );
}
