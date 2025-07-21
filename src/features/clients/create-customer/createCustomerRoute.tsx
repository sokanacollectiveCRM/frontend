// src/features/clients/ClientsRoutes.tsx
import { Route } from 'react-router-dom';
import CreateCustomerPage from './createCustomer';

/**
 * Returns the <Route> tree for all client-conversion pages.
 * Drop this into your DashboardLayout alongside the other *Routes() factories.
 */
const ClientsRoutes = () => (
  <Route path='/clients'>
    {/* other /clients routes (list/detail) */}
    <Route path='/clients/new' element={<CreateCustomerPage />} />
  </Route>
);

export default ClientsRoutes;
