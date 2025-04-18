
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import NavBar from '@/common/components/navigation/navbar/NavBar';

const Nav = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function NavLayout() {

  return (
    <Nav>
      <NavBar />
      <Outlet />
    </Nav>
  );
}
