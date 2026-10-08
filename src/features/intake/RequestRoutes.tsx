import { Navigate, Route } from 'react-router-dom';

import RequestForm from './RequestForm';

const RequestRoutes = () => (
  <>
    <Route
      path='request'
      element={<Navigate to='/request/sokana360' replace />}
    />
    <Route path='request/:tenantSlug' element={<RequestForm />} />
  </>
);

export default RequestRoutes;
