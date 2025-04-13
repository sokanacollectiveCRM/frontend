import { BrowserRouter } from 'react-router-dom';

import { UserProvider } from "@/common/contexts/UserContext.jsx";
import AppRoutes from "./Routes";

 

import './App.css';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

