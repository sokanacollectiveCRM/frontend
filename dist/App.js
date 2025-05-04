import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from "@/common/contexts/UserContext.jsx";
import AppRoutes from "./Routes";
import './App.css';
export default function App() {
    return (_jsx(UserProvider, { children: _jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }) }));
}
