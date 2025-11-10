import { Route } from 'react-router-dom';

import Clients from '@/features/clients/Clients';

const ClientRoutes = () => (
  <Route>
    <Route path='clients' element={<Clients />} />
    <Route path='clients/:clientId' element={<Clients />} />
    <Route path='admin'>
      <Route path='clients' element={<Clients />} />
      <Route path='clients/:clientId' element={<Clients />} />
    </Route>
  </Route>
);

export default ClientRoutes;
