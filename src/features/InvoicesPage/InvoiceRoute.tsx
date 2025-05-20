// src/features/invoices/InvoicesRoutes.tsx
import { Route } from 'react-router-dom';
import InvoicesPage from './InvoicesPage';

const InvoicesRoutes = () => (
  <Route path="/invoices" element={<InvoicesPage />} />
);

export default InvoicesRoutes;
