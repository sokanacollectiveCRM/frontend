import { Route } from 'react-router-dom';

import RequestForm from "./RequestForm";

const RequestRoutes = () => (
    <Route path='request' element = {<RequestForm />} />
);

export default RequestRoutes