
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import NavBar from '@/common/components/navigation/NavBar';
import { UserContext } from '@/common/contexts/UserContext';

const Layout = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function NavLayout() {
  const { user } = useContext(UserContext);

  return (
    <Layout>
      { user ? <div> {user.role} </div> : <NavBar /> }
      <Outlet />
    </Layout>
  );
}
