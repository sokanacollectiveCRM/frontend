import { Route } from 'react-router-dom';
import ContractPaymentDemo from './components/ContractPaymentDemo';

const ContractPaymentDemoRoute = () => (
  <Route path='/payment-demo' element={<ContractPaymentDemo />} />
);

export default ContractPaymentDemoRoute;
