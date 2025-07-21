import { Route } from 'react-router-dom';

import Pipeline from './Pipeline';

const PipelineRoutes = () => (
  <Route>
    <Route path='pipeline' element={<Pipeline />} />
  </Route>
);

export default PipelineRoutes;
