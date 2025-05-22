import { Route } from "react-router-dom";
import Hours from "./Hours";

const HoursRoutes = () => (
  <Route>
      <Route path = "/hours" element = {<Hours />} />
  </Route>
);

export default HoursRoutes;