export type AuthErrorContext =
  | 'login'
  | 'mfa'
  | 'invitation'
  | 'password-reset'
  | 'password-setup'
  | 'verification'
  | 'generic';

const DEFAULT_MESSAGES: Record<AuthErrorContext, string> = {
  login: 'We could not sign you in. Please try again.',
  mfa: 'We could not verify your code. Please try again.',
  invitation: 'We could not process this invitation. Please try again.',
  'password-reset': 'We could not reset your password. Please try again.',
  'password-setup': 'We could not set your password. Please try again.',
  verification: 'We could not verify your email. Please try again.',
  generic: 'Something went wrong. Please try again.',
};

function errorDetails(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) {
    const code = (error as Error & { code?: unknown }).code;
    return `${typeof code === 'string' ? code : ''} ${error.message}`.trim();
  }
  if (error && typeof error === 'object') {
    const value = error as { code?: unknown; message?: unknown };
    return `${typeof value.code === 'string' ? value.code : ''} ${typeof value.message === 'string' ? value.message : ''}`.trim();
  }
  return '';
}

export function authErrorMessage(
  error: unknown,
  context: AuthErrorContext = 'generic'
): string {
  const details = errorDetails(error).toLowerCase();

  if (
    /failed to fetch|load failed|network-request-failed|network error|offline|timeout|timed out/.test(
      details
    )
  )
    return 'We could not connect. Check your internet connection and try again.';

  if (
    /invalid-credential|invalid login credentials|wrong-password|user-not-found|incorrect password|invalid email or password/.test(
      details
    )
  )
    return context === 'invitation'
      ? 'That password is incorrect. Try again or reset your password before accepting the invitation.'
      : 'The email or password is incorrect. Check both and try again, or reset your password.';

  if (/invalid-email|valid email is required/.test(details))
    return 'Enter a valid email address.';

  if (/user-disabled|account.*disabled|account.*suspended/.test(details))
    return 'This account is disabled. Contact a Sokana administrator for help.';

  if (/too-many-requests|too many.*attempt|rate.?limit/.test(details))
    return 'Too many attempts. Wait a few minutes, then try again.';

  if (
    /invalid verification code|verification code expired|verification code already used|invalid or expired verification code|invalid or expired challenge/.test(
      details
    )
  )
    return 'That verification code is incorrect or expired. Use the newest code from your email or request another one.';

  if (/session mismatch|sign in again/.test(details))
    return 'Your sign-in session expired. Please sign in again.';

  if (/email.*not verified|verify your email/.test(details))
    return 'Verify your email before signing in. Open the newest verification email or request another link.';

  if (/code accepted.*session|session could not be verified/.test(details))
    return 'Your code was accepted, but we could not finish signing you in. Please sign in again.';

  if (
    /expired-action-code|invalid-action-code|reset token.*(missing|not found|expired)/.test(
      details
    )
  )
    return context === 'invitation'
      ? 'This invitation link has expired or was already used. Ask an administrator to send a new invitation.'
      : 'This password reset link has expired or was already used. Request a new link.';

  if (
    /invitation.*(expired|invalid|used|revoked)|invite.*(expired|invalid|used|revoked)/.test(
      details
    )
  )
    return 'This invitation link has expired or was already used. Ask an administrator to send a new invitation.';

  if (/weak-password|password must be at least/.test(details))
    return 'Choose a stronger password that meets all of the requirements shown.';

  if (
    /email-already-in-use|email is already in use|account already exists/.test(
      details
    )
  )
    return 'An account already exists for this email. Sign in or reset the password instead.';

  if (
    /staff access only|does not have access|no active.*membership|membership.*inactive/.test(
      details
    )
  )
    return 'This account does not currently have access to Sokana360. Ask an administrator to invite or restore the account.';

  if (/did not start email verification|could not send.*code/.test(details))
    return 'We signed you in, but could not send the verification code. Wait a moment and try again.';

  if (/could not resend|failed to resend/.test(details))
    return 'We could not send a new code. Wait a moment and try again.';

  if (
    /could not send verification email|failed to send.*verification/.test(
      details
    )
  )
    return 'We could not send the verification email. Wait a moment and try again.';

  if (/no user data received/.test(details))
    return 'We could not finish signing you in. Please try again.';

  return DEFAULT_MESSAGES[context];
}
