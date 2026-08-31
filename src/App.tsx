import { BrowserRouter, useLocation } from 'react-router-dom';

import { UserProvider } from '@/common/contexts/UserContext.jsx';
import AppRoutes from './Routes';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'sonner';
import './App.css';

function RoutedApp() {
  const isPublicSigningRoute = useLocation().pathname.startsWith('/signing/');
  const routes = <AppRoutes />;

  return isPublicSigningRoute ? routes : <UserProvider>{routes}</UserProvider>;
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <RoutedApp />
      </BrowserRouter>
      <Toaster
        richColors
        position='bottom-right'
        expand
        visibleToasts={5}
        closeButton
      />
      <ToastContainer />
    </>
  );
}
