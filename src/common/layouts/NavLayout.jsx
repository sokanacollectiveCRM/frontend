import React from 'react';

import { Outlet } from 'react-router-dom';

import NavBar from 'common/navigation/NavBar';

export default function NavLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
