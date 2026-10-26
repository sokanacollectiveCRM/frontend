import { Route } from 'react-router-dom';

import AuthCallback from './AuthCallback';
import ClientLogin from './ClientLogin';
import Login from './Login';
import ResetPassword from './ResetPassword';
import SetPassword from './SetPassword';
import SignUp from './SignUp';

export const AuthPublicRoutes = () => (
  <Route>
    <Route path='login' element={<Login />} />
    <Route path='signup' element={<SignUp />} />
  </Route>
);

export const AuthRoutes = () => (
  <Route>
    <Route path='auth/callback' element={<AuthCallback />} />
    <Route path='auth/reset-password' element={<ResetPassword />} />
    {/* Note: auth/set-password and auth/client-login are defined in Routes.tsx to bypass PublicOnlyRoute */}
  </Route>
);
