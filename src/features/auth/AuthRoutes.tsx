import { Route } from 'react-router-dom';

import AuthCallback from './AuthCallback';
import Login from './Login';
import RequestPasswordReset from './RequestPasswordReset';
import ResetPassword from './ResetPassword';
import SignUp from './SignUp';

export const AuthPublicRoutes = () => (
  <Route>
    <Route path='login' element={<Login />} />
    <Route path='signup' element={<SignUp />} />
    <Route path='forgot-password' element={<RequestPasswordReset />} />
  </Route>
);

export const AuthRoutes = () => (
  <Route>
    <Route path='auth/callback' element={<AuthCallback />} />
    <Route path='auth/reset-password' element={<ResetPassword />} />
  </Route>
);
