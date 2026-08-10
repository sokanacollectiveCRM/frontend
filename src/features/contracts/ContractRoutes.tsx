import { Route } from 'react-router-dom';

import Contracts from './Contracts';

const ContractRoutes = () => (
  <Route path='/contracts' element={<Contracts />} />
);
export default ContractRoutes;
