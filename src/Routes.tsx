import { PrivateRoute, PublicOnlyRoute } from '@/common/components/routes/ProtectedRoutes';
import NavLayout from "@/common/layouts/NavLayout";
import { AuthPublicRoutes, AuthRoutes } from '@/features/auth/AuthRoutes';
import ClientRoutes from "@/features/clients/ClientRoutes";
import RequestRoutes from "@/features/request/RequestRoutes";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './common/layouts/DashboardLayout';
import AdminPayRoute from './features/AdminPayment/AdminPayRoute';
import MyAccount from './pages/my-account/MyAccount';

const AppRoutes = () => (
  <Routes>

    <Route element={<PublicOnlyRoute />}>
      <Route element={<NavLayout />}>
        {AuthPublicRoutes()}
        <Route element={<DashboardLayout />}>
        {AdminPayRoute()}
        </Route>
      </Route>
    </Route>

    <Route element={<PrivateRoute />}>
        <Route index element={<Home />} />
        {ClientRoutes()}
        {RequestRoutes()}
        <Route path='/my-account' element={<MyAccount />} />
    </Route>
    

    {AuthRoutes()}
    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default AppRoutes;