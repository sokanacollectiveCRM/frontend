import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router';

import NavLayout from 'common/layouts/NavLayout';
import LogIn from 'pages/account/LogIn';
import SignUp from 'pages/account/SignUp';
import Home from 'pages/home/Home';
import NotFound from 'pages/not-found/NotFound';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<NavLayout />}>
          <Route index element={<Home />} />
          <Route path='login' element={<LogIn />} />
          <Route path='signup' element={<SignUp />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
