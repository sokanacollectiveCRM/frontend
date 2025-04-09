import { PrivateRoute, PublicOnlyRoute } from '@/common/components/routes/ProtectedRoutes';
import NavLayout from "@/common/layouts/NavLayout";
import { AuthPublicRoutes, AuthRoutes } from '@/features/auth/AuthRoutes';
import ClientRoutes from "@/features/clients/ClientRoutes";
import RequestRoutes from "@/features/request/RequestRoutes";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './common/layouts/DashboardLayout';
import AdminPayRoute from './features/admin-payment/AdminPayRoute';
import MyAccount from './pages/my-account/MyAccount';

const AppRoutes = () => (
  <Routes>

    <Route element={<PublicOnlyRoute />}>
      <Route element={<NavLayout />}>
        {AuthPublicRoutes()}
      </Route>
    </Route>

    <Route element={<PrivateRoute />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<Home />} />
        {ClientRoutes()}
        {RequestRoutes()}
        {AdminPayRoute()}
        <Route path='/my-account' element={<MyAccount />} />
      </Route>
    </Route>

    {AuthRoutes()}
    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default AppRoutes;