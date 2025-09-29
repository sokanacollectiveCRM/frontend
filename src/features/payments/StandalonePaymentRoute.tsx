import { Route } from 'react-router-dom';
import ContractPayment from './components/ContractPayment';

const StandalonePaymentRoute = () => (
  <Route path='/payment' element={<ContractPayment />} />
);

export default StandalonePaymentRoute;


