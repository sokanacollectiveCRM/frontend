import React from 'react';
import { Outlet } from 'react-router-dom';

export default function NavLayout() {
  return (
    <>
      <div>Navbar</div>
      <Outlet />
    </>
  );
}
