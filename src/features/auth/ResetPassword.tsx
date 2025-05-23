import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/common/hooks/user/useUser';
import { toast } from 'sonner';

import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';

import styled from 'styled-components';

const PasswordStrength = styled.div<{ strength: string }>`
  height: 5px;
  margin-top: 5px;
  background-color: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return '#ff4d4d';
      case 'medium':
        return '#ffd700';
      case 'strong':
        return '#32cd32';
      default:
        return '#ccc';
    }
  }};
  width: ${({ strength }) => {
    switch (strength) {
      case 'weak':
        return '33%';
      case 'medium':
        return '66%';
      case 'strong':
        return '100%';
      default:
        return '0%';
    }
  }};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const PasswordRequirements = styled.ul`
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
  padding-left: 20px;
`;

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (!access_token) {
      toast.error('No reset token found. Please request a new link.');
    } else if (type !== 'recovery') {
      toast.error('Invalid reset link type.');
    }
  }, []);

  const checkPasswordStrength = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength =
      (hasUpperCase ? 1 : 0) +
      (hasLowerCase ? 1 : 0) +
      (hasNumbers ? 1 : 0) +
      (hasSpecialChar ? 1 : 0) +
      (password.length >= 8 ? 1 : 0);

    if (strength >= 4) return 'strong';
    if (strength >= 2) return 'medium';
    return 'weak';
  };

  const validatePassword = (password: string) => {
    const requirements = [];

    if (password.length < 8) {
      requirements.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push('Include at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      requirements.push('Include at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      requirements.push('Include at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      requirements.push('Include at least one special character');
    }

    return requirements;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const access_token = hashParams.get('access_token');

    if (!access_token) {
      toast.error('Reset token not found. Please request a new link.');
      return;
    }

    const requirements = validatePassword(password);
    if (requirements.length > 0) {
      toast.error(requirements.join(', '));
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password, access_token);
      toast.success('Password updated! You can now log in.');
      navigate('/login', {
        state: {
          message: 'Password has been reset successfully.',
        },
        replace: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Enter a new password below to complete your reset.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordStrength strength={checkPasswordStrength(password)} />
              {password && (
                <PasswordRequirements>
                  {validatePassword(password).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </PasswordRequirements>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}