
import { BrowserRouter } from 'react-router-dom';
import { PrivateRoute, PublicOnlyRoute } from "@/common/components/routes/ProtectedRoutes";
import { UserProvider } from "@/common/contexts/UserContext";
import NavLayout from "@/common/layouts/NavLayout";
import AuthCallback from "@/pages/account/AuthCallback";
import Login from "@/pages/account/Login";
import RequestPasswordReset from "@/pages/account/RequestPasswordReset";
import ResetPassword from "@/pages/account/ResetPassword";
import SignUp from "@/pages/account/SignUp";
import Clients from "@/pages/clients/Clients";
import Home from "@/pages/home/Home";
import NotFound from "@/pages/not-found/NotFound";
import RequestForm from "@/pages/request/RequestForm";
import MyAccount from './pages/my-account/MyAccount'; 
import AppRoutes from "./routes";

import '@/styles/App.css';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavLayout />} />
          <Route element={<PrivateRoute />} />
          <Route index element={<Home />} />
          <Route path='clients' element={<Clients />} />
          <Route path="my-account" element={<MyAccount />} />
          <Route element={<PublicOnlyRoute />} />
          <Route path='login' element={<Login />} />
          <Route path='request' element={<RequestForm />} />
          <Route path='signup' element={<SignUp />} />
          <Route path='forgot-password' element={<RequestPasswordReset />} />
          <Route path='auth/callback' element={<AuthCallback />} />
          <Route path='auth/reset-password' element={<ResetPassword />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <AppRoutes />
    </UserProvider>
  );
}

