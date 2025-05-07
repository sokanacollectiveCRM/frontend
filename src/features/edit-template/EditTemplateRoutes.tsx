import { PrivateRoute } from '@/common/components/routes/ProtectedRoutes';
import { Route } from 'react-router-dom';

import EditTemplate from './EditTemplate';

const EditTemplateRoutes = () => (
  <Route>
    <Route element={<PrivateRoute />}>
      <Route path="templates/:templateId" element={<EditTemplate />} />
    </Route>
  </Route>
)
export default EditTemplateRoutes