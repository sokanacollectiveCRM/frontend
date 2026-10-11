import { Route } from 'react-router-dom';

import AdminVisitsPage from '@/features/scheduling/AdminVisitsPage';

const SchedulingRoutes = () => (
  <Route path='/scheduling' element={<AdminVisitsPage />} />
);

export default SchedulingRoutes;
