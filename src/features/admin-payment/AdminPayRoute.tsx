import { Route } from "react-router-dom";
import AdminPay from "./AdminPay";

const AdminPayRoute = () => (
  <Route path="/payments" element={<AdminPay />} />
)

export default AdminPayRoute