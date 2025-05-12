import { Route } from 'react-router-dom';

import EditTemplate from './Contracts';

const ContractRoutes = () => (
  <Route>
      <Route path="contracts" element={<EditTemplate />} />
  </Route>
)
export default ContractRoutes