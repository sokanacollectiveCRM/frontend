import { jsx as _jsx } from "react/jsx-runtime";
import { Route } from "react-router-dom";
import Hours from "./Hours";
import { PrivateRoute } from "@/common/components/routes/ProtectedRoutes";
var HoursRoute = function () { return (_jsx(Route, { children: _jsx(Route, { element: _jsx(PrivateRoute, {}), children: _jsx(Route, { path: "/hours", element: _jsx(Hours, {}) }) }) })); };
export default HoursRoute;
