import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

// import { Input } from '@/common/components/form/Input';
import { useUser } from '@/common/hooks/user/useUser';


import { RedSpan } from '@/common/components/form/styles';

import SubmitButton from '@/common/components/form/SubmitButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import GoogleButton from '@/features/auth/GoogleButton';


export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {  googleAuth } = useUser();

  const [formState, setFormState] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    username: '',
  });

  const handleChangeFirstname = (e) => {
    setFormState({ ...formState, firstname: e.target.value });
    setError('');
  };

  const handleChangeLastname = (e) => {
    setFormState({ ...formState, lastname: e.target.value });
    setError('');
  };

  const handleChangeEmail = (e) => {
    setFormState({ ...formState, email: e.target.value });
    setError('');
  };

  const handleChangePassword = (e) => {
    setFormState({ ...formState, password: e.target.value });
    setError('');
  };

  const handleChangeUsername = (e) => {
    setFormState({ ...formState, username: e.target.value });
    setError('');
  };

  const handleGoogleSignup = async () => {
    try {
      await googleAuth();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.email,
            password: formState.password,
            username: formState.username || undefined,
            firstname: formState.firstname || undefined,
            lastname: formState.lastname || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      alert(
        'Account created successfully! Please check your email to verify your account.'
      );
      navigate('/login', {
        state: {
          message:
            'Account created successfully! Please check your email to verify your account.',
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <RedSpan>{error}</RedSpan>}
            <div className="grid gap-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                name="firstname"
                placeholder="First Name"
                value={formState.firstname}
                onChange={handleChangeFirstname}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                name="lastname"
                placeholder="Last Name"
                value={formState.lastname}
                onChange={handleChangeLastname}
              />
            </div>  

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="j@example.com"
                value={formState.email}
                onChange={handleChangeEmail}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johnsmith"
                value={formState.username}
                onChange={handleChangeUsername}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                value={formState.password}
                onChange={handleChangePassword}
                required
              />
            </div>
            <SubmitButton disabled={isLoading} className="w-full">
              {isLoading ? "Logging in..." : "Log In"}
            </SubmitButton>
            <GoogleButton
              onClick={handleGoogleSignup}
              isLoading={isLoading}
              text='Sign up with Google'
  />
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}