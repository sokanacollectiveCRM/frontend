// src/features/integrations/QuickBooksRoutes.tsx
import { Route } from 'react-router-dom';
import QuickBooksConnect from './QuickBooksConnect'; // same folder; adjust if you placed it elsewhere

/**
 * Returns the <Route> tree for all QuickBooks-integration pages.
 * Drop this into DashboardLayout alongside the other *Routes() factories.
 */
const QuickBooksRoutes = () => (
  <Route path='/integrations/quickbooks' element={<QuickBooksConnect />} />
);

export default QuickBooksRoutes;
