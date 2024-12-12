import React from 'react';

import { Outlet } from 'react-router-dom';

import { Button } from 'common/components/ButtonSC';

export default function NavLayout() {
  return (
    <>
      <div>
        <h3>Navbar</h3>
        <Button>nav button</Button>
      </div>
      <Outlet />
    </>
  );
}
