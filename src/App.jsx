import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import NavLayout from 'common/layouts/NavLayout';
import Login from 'pages/auth/Login';
import SignUp from 'pages/auth/SignUp';
import Home from 'pages/home/Home';
import NotFound from 'pages/not-found/NotFound';

import './App.css';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavLayout />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<SignUp />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
