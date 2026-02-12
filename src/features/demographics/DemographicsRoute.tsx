import { Route } from 'react-router-dom';
import DemographicsPage from './DemographicsPage';

export function DemographicsRoute() {
  return <Route path="/demographics" element={<DemographicsPage />} />;
}
