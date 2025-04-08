import { PrivateRoute } from '@/common/components/routes/ProtectedRoutes';
import NavLayout from "@/common/layouts/NavLayout";
import AuthRoutes from '@/features/auth/AuthRoutes';
import ClientRoutes from "@/features/clients/ClientRoutes";
import RequestRoutes from "@/features/request/RequestRoutes";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Route, Routes } from 'react-router-dom';
import AdminPayRoute from './features/AdminPayment/AdminPayRoute';

const AppRoutes = () => (
  <Routes>
    <Route path='/'>
      <Route element={<PrivateRoute />}>
        <Route index element={<Home />} />
      </Route>
      {ClientRoutes()}
      {AuthRoutes()}
      {RequestRoutes()}
      {AdminPayRoute()}
      <Route path='*' element={<NotFound />} />
    </Route>
  </Routes>
);

export default AppRoutes;