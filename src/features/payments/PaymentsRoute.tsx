import { Route } from "react-router-dom";
import PaymentsPage from "./PaymentsPage";

const PaymentsRoute = () => (
  <Route path="/payments" element={<PaymentsPage />} />
);

export default PaymentsRoute; 