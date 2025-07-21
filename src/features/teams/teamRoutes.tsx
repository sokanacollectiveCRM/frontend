import { Route } from 'react-router-dom';
import Teams from './teams';

const TeamRoutes = () => (
  <Route>
    <Route path='team' element={<Teams />} />
  </Route>
);

export default TeamRoutes;
