import { Route } from 'react-router-dom';
import BillingContractDetailPage from '@/features/billing-portal/BillingContractDetailPage';
import BillingContractsListPage from '@/features/billing-portal/BillingContractsListPage';

const BillingPortalRoutes = () => (
  <>
    <Route path='/billing/contracts' element={<BillingContractsListPage />} />
    <Route path='/billing/payment-schedules' element={<BillingContractsListPage />} />
    <Route path='/billing/contracts/:contractId' element={<BillingContractDetailPage />} />
    <Route
      path='/billing/payment-schedules/:contractId'
      element={<BillingContractDetailPage />}
    />
  </>
);

export default BillingPortalRoutes;
