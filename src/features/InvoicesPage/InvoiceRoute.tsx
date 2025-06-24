// src/features/invoices/InvoicesRoutes.tsx
import { PrivateRoute } from '@/common/components/routes/ProtectedRoutes';
import { Route } from 'react-router-dom';
import InvoicesPage from './InvoicesPage';

const InvoicesRoutes = () => (
  <Route element={<PrivateRoute />}>
    <Route path="/invoices" element={<InvoicesPage />} />
  </Route>
);

export default InvoicesRoutes;
