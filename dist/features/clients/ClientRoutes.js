import { jsx as _jsx } from "react/jsx-runtime";
import { PrivateRoute } from '@/common/components/routes/ProtectedRoutes';
import { Route } from 'react-router-dom';
import Clients from "@/features/clients/Clients";
var ClientRoutes = function () { return (_jsx(Route, { children: _jsx(Route, { element: _jsx(PrivateRoute, {}), children: _jsx(Route, { path: 'clients', element: _jsx(Clients, {}) }) }) })); };
export default ClientRoutes;
