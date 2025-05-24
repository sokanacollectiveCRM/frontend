import { Route } from 'react-router-dom';

import Clients from "@/features/clients/Clients";

const ClientRoutes = () => (
  <Route>
      <Route path='clients' element = {<Clients />} />
  </Route>
)

export default ClientRoutes