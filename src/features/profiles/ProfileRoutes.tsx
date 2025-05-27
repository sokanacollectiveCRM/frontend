import { Route } from "react-router-dom";
import Profile from "./Profile";

const ProfileRoutes = () => (
  <Route path="/specified/:clientId" element={<Profile />} />
)

export default ProfileRoutes