import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import NavBar from '@/common/components/navigation/navbar/NavBar';

const Nav = styled.div`
  min-height: 100dvh;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
`;

export default function NavLayout() {
  return (
    <Nav>
      <NavBar />
      <Outlet />
    </Nav>
  );
}
