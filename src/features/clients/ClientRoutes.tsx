import { PrivateRoute } from '@/common/components/routes/ProtectedRoutes';
import { Route } from 'react-router-dom';

import Clients from "@/features/clients/Clients";

const ClientRoutes = () => (
  <Route>
    <Route element={<PrivateRoute/>} >
      <Route path='clients' element = {<Clients />} />
    </Route>
  </Route>
)

export default ClientRoutes