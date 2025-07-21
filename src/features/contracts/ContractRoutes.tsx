import { Route } from 'react-router-dom';

import Contracts from './Contracts';

const ContractRoutes = () => (
  <Route>
    <Route path='contracts' element={<Contracts />} />
  </Route>
);
export default ContractRoutes;
