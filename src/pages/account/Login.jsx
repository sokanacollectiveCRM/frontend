import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import GoogleButton from '@/common/components/GoogleButton';
// import { Input } from '@/common/components/form/Input'; Not sure if we need this anymore
import SubmitButton from '@/common/components/form/SubmitButton';
import { RedSpan } from '@/common/components/form/styles';
import { useUser } from '@/common/contexts/UserContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: -10px;
  align-self: flex-end;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const { login, googleAuth } = useUser();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formState.email, formState.password);
      navigate('/', { replace: true });
    } catch (error) {
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleAuth();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Log In</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <RedSpan>{error}</RedSpan>}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                name="email" 
                placeholder="jsmith or j@example.com" 
                value={formState.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                name="password" 
                value={formState.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <SubmitButton disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Log In"}
            </SubmitButton>
            <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} text="Sign in with Google" />
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// This was the previous code. There is a good chance we might decide to use styled components again but with shadcn, we'll see
// so keep this here for now so we can go back and look.

{/* <StyledPage>
<Form onSubmit={handleSubmit}>
  <FormTitle>Log In</FormTitle>
  {error && <RedSpan>{error}</RedSpan>}
  <Input.Text
    title='Email'
    name='email'
    placeholder='jsmith or j@example.com'
    value={formState.email}
    onChange={handleChange}
    required
  />
  <Input.Password
    title='Password'
    name='password'
    value={formState.password}
    onChange={handleChange}
    required
  />
  <StyledLink to='/forgot-password'>Forgot Password?</StyledLink>
  <SubmitButton disabled={isLoading}>
    {isLoading ? 'Logging in...' : 'Log In'}
  </SubmitButton>
  <GoogleButton
    onClick={handleGoogleLogin}
    isLoading={isLoading}
    text='Sign in with Google'
  />
</Form>
</StyledPage> */}