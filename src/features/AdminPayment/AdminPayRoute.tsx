import { RouteIcon } from "lucide-react";
import AdminPay from "./AdminPay";
import { Route } from "react-router-dom";

const AdminPayRoute = () => (
  <Route path = "/AdminPay" element = {<AdminPay/>} />
)

export default AdminPayRoute