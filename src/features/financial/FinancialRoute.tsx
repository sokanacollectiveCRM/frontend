import { Route } from 'react-router-dom';
import EmptyFinancialPage from './EmptyFinancialPage';

export function FinancialRoute() {
  return <Route path="/financial" element={<EmptyFinancialPage />} />;
}
