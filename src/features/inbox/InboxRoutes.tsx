import { Route } from 'react-router-dom';

import Inbox from "@/features/inbox/Inbox";

const InboxRoutes = () => (
  <Route>
    <Route path='inbox' element={<Inbox />} />
  </Route>
)

export default InboxRoutes