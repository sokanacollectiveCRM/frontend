import { Route } from "react-router-dom";
import Hours from "./Hours";
import { PrivateRoute } from "@/common/components/routes/ProtectedRoutes";

const HoursRoute = () => (
  <Route>
    <Route element={<PrivateRoute/>} >
      <Route path = "/hours" element = {<Hours />} />
    </Route>
  </Route>
);

export default HoursRoute;