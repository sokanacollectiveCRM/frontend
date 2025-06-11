import { BrowserRouter } from 'react-router-dom';

import { UserProvider } from "@/common/contexts/UserContext.jsx";
import AppRoutes from "./Routes";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'sonner';
import './App.css';

export default function App() {
  return (
    <>
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
      <Toaster richColors position="bottom-right" />
      <ToastContainer />
    </>
  );
}

