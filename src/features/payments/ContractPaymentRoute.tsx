import { Route } from 'react-router-dom';
import ContractPayment from './components/ContractPayment';

const ContractPaymentRoute = () => (
  <Route path='/payment' element={<ContractPayment />} />
);

export default ContractPaymentRoute;
