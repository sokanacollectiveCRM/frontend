import { describe, expect, it } from 'vitest';

import { authErrorMessage } from '@/features/auth/authErrorMessage';

describe('authErrorMessage', () => {
  it.each([
    [
      { code: 'auth/invalid-credential', message: 'Firebase credential error' },
      'login',
      'The email or password is incorrect. Check both and try again, or reset your password.',
    ],
    [
      new Error('Invalid or expired verification code'),
      'mfa',
      'That verification code is incorrect or expired. Use the newest code from your email or request another one.',
    ],
    [
      new Error('auth/expired-action-code'),
      'password-reset',
      'This password reset link has expired or was already used. Request a new link.',
    ],
    [
      new Error('This invitation was revoked'),
      'invitation',
      'This invitation link has expired or was already used. Ask an administrator to send a new invitation.',
    ],
    [
      new TypeError('Failed to fetch'),
      'login',
      'We could not connect. Check your internet connection and try again.',
    ],
    [
      new Error('Could not send verification email.'),
      'verification',
      'We could not send the verification email. Wait a moment and try again.',
    ],
  ] as const)(
    'translates %o into a friendly message',
    (error, context, expected) => {
      expect(authErrorMessage(error, context)).toBe(expected);
    }
  );

  it('does not expose an unknown provider error', () => {
    expect(
      authErrorMessage(
        new Error(
          'IDENTITYTOOLKIT_INTERNAL_ERROR: accounts:signInWithPassword'
        ),
        'login'
      )
    ).toBe('We could not sign you in. Please try again.');
  });
});
