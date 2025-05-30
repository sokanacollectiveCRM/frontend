import NavLayout from "@/common/layouts/NavLayout";
import { AuthPublicRoutes, AuthRoutes } from '@/features/auth/AuthRoutes';
import ClientRoutes from '@/features/clients/ClientRoutes';
import Home from "@/features/dashboard-home/Home";
import NotFound from "@/features/not-found/NotFound";
import PipelineRoutes from '@/features/pipeline/PipelineRoutes';
import RequestRoutes from "@/features/request/RequestRoutes";
import { Route, Routes } from 'react-router-dom';
import { PrivateRoute, PublicOnlyRoute } from "./common/components/routes/ProtectedRoutes";
import DashboardLayout from './common/layouts/DashboardLayout';
import AdminPayRoute from './features/admin-payment/AdminPayRoute';
import ContractRoutes from "./features/contracts/ContractRoutes";
import { default as HoursRoute, default as HoursRoutes } from './features/hours/HoursRoute';
import InboxRoutes from "./features/inbox/InboxRoutes";
import MyAccountRoutes from "./features/my-account/MyAccountRoutes";
import ProfileRoutes from './features/profiles/ProfileRoutes';
import TeamRoutes from "./features/teams/teamRoutes";
const AppRoutes = () => (
  <Routes>

    <Route>
      <Route element={<NavLayout />}>
        <Route element={<PublicOnlyRoute />} >
          {AuthRoutes()}
          {AuthPublicRoutes()}
          {RequestRoutes()}
        </Route>
      </Route>
    </Route>

    <Route>
      <Route element={<DashboardLayout />}>
        <Route element={<PrivateRoute />} >
          <Route index element={<Home />} />
          {ContractRoutes()}
          {PipelineRoutes()}
          {ClientRoutes()}
          {AdminPayRoute()}
          {HoursRoute()}
          {ProfileRoutes()}
          {MyAccountRoutes()}
          {HoursRoutes()}
          {TeamRoutes()}
          {InboxRoutes()}
        </Route>
      </Route>
    </Route>


    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default AppRoutes;