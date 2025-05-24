import { useState } from 'react';

import styled from 'styled-components';

import { Alert, AlertDescription, AlertTitle } from '@/common/components/ui/alert';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useUser } from '@/common/hooks/user/useUser';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      toast.success('Password reset instructions sent to your email');
      setSuccess(true);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Reset Password'
                )}
              </Button>
              <div className="text-center text-sm">
                <Link to="/login" className="underline underline-offset-4">
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <Alert>
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                We sent you a link to reset your password. If it doesn't arrive shortly,
                be sure to check your spam folder.
              </AlertDescription>
              <div className="mt-4 text-center text-sm">
                <Link to="/login" className="underline underline-offset-4">
                  Return to Login
                </Link>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
