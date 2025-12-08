import { Route } from 'react-router-dom';
import DoulaListPage from './components/DoulaListPage';
import DoulaDetailPage from './components/DoulaDetailPage';

const HoursRoutes = () => (
  <Route>
    <Route path='/hours' element={<DoulaListPage />} />
    <Route path='/hours/:id' element={<DoulaDetailPage />} />
  </Route>
);

export default HoursRoutes;
