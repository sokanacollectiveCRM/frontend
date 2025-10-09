import { Route } from 'react-router-dom';
import ContractPaymentDemo from './components/ContractPaymentDemo';

const StandalonePaymentDemoRoute = () => (
  <Route path='/payment-demo' element={<ContractPaymentDemo />} />
);

export default StandalonePaymentDemoRoute;





