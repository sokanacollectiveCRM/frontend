import NavLayout from "@/common/layouts/NavLayout";
import { AuthPublicRoutes, AuthRoutes } from '@/features/auth/AuthRoutes';
import ClientRoutes from '@/features/clients/ClientRoutes';
import Home from "@/features/dashboard-home/Home";
import NotFound from "@/features/not-found/NotFound";
import PipelineRoutes from '@/features/pipeline/PipelineRoutes';
import RequestRoutes from "@/features/request/RequestRoutes";
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './common/layouts/DashboardLayout';
import AdminPayRoute from './features/admin-payment/AdminPayRoute';
import Hours from './features/hours/Hours';
import HoursRoute from './features/hours/HoursRoute';
import QuickBooksRoutes from './features/integrations/QuickBooksRoutes';
import MyAccount from './features/my-account/MyAccount';
import ProfileRoutes from './features/profiles/ProfileRoutes';

const AppRoutes = () => (
  <Routes>

    <Route>
      <Route element={<NavLayout />}>
        {AuthPublicRoutes()}
      </Route>
    </Route>

    <Route>
      <Route element={<DashboardLayout />}>
        <Route index element={<Home />} />
        {PipelineRoutes()}
        {ClientRoutes()}
        {RequestRoutes()}
        {AdminPayRoute()}
        {HoursRoute()}
        {ProfileRoutes()}
        {QuickBooksRoutes()}
        <Route path='/my-account' element={<MyAccount />} />
        <Route path='/hours' element={<Hours />}/>
      </Route>
    </Route>

    {AuthRoutes()}
    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default AppRoutes;