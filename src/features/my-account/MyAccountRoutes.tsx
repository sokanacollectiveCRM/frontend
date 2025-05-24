import { Route } from "react-router-dom";
import MyAccount from "./MyAccount";

const MyAccountRoutes = () => (
  <Route>
      <Route path = "/my-account" element = {<MyAccount />} />
  </Route>
);

export default MyAccountRoutes;