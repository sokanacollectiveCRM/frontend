import React, { useEffect } from 'react';

import { BrowserRouter, Route, Routes } from 'react-router';
import { getOrGenerateKeyPair } from 'utils/crypto';

import { UserProvider } from 'common/contexts/UserContext';
import NavLayout from 'common/layouts/NavLayout';
import AuthCallback from 'pages/account/AuthCallback';
import Login from 'pages/account/Login';
import SignUp from 'pages/account/SignUp';
import Home from 'pages/home/Home';
import NotFound from 'pages/not-found/NotFound';

import './App.css';

function App() {
  useEffect(() => {
    async function initializeCrypto() {
      try {
        await getOrGenerateKeyPair();
      } catch (error) {
        console.error('Failed to initialize crypto:', error);
      }
    }

    initializeCrypto();
  }, []);

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavLayout />}>
            <Route index element={<Home />} />
            <Route path='Login' element={<Login />} />
            <Route path='signup' element={<SignUp />} />
            <Route path='auth/callback' element={<AuthCallback />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
