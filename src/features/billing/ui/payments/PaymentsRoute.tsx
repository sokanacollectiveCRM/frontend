import { Route } from 'react-router-dom';
import FinancialPage from '@/features/financial/FinancialPage';
import ReconciliationPage from '@/features/financial/ReconciliationPage';

const PaymentsRoute = () => (
  <>
    <Route path="/payments" element={<FinancialPage />} />
    <Route path="/payments/reconciliation" element={<ReconciliationPage />} />
  </>
);

export default PaymentsRoute;
