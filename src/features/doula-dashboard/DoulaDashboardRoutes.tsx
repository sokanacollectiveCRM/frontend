import { Route } from 'react-router-dom';
import DoulaDashboard from './DoulaDashboard';

const DoulaDashboardRoutes = () => (
  <Route>
    <Route path='/doula-dashboard' element={<DoulaDashboard />} />
  </Route>
);

export default DoulaDashboardRoutes;

