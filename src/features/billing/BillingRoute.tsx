import { Route } from 'react-router-dom';
import BillingPage from './BillingPage';

const BillingRoute = () => (
  <Route path="/billing" element={<BillingPage />} />
);

export default BillingRoute; 