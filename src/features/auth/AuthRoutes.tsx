import { PublicOnlyRoute } from '@/common/components/routes/ProtectedRoutes';
import { Route } from 'react-router-dom';

import AuthCallback from "./AuthCallback";
import Login from "./Login";
import RequestPasswordReset from "./RequestPasswordReset";
import ResetPassword from "./ResetPassword";
import SignUp from "./SignUp";
import NavLayout from '@/common/layouts/NavLayout';

const AuthRoutes = () => (
  <Route element = {<NavLayout/>}>
    <Route element={<PublicOnlyRoute />}>
      <Route path='login' element={<Login />} />
      <Route path='signup' element={<SignUp />} />
      <Route path='forgot-password' element={<RequestPasswordReset />} />
    </Route>
    <Route path='auth/callback' element={<AuthCallback />} />
    <Route path='auth/reset-password' element={<ResetPassword />} />
  </Route>
);

export default AuthRoutes;