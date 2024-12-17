import React, { useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from 'common/components/Button';
import { UserContext } from 'common/contexts/UserContext';

const StyledNav = styled.nav`
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  font-size: 20px;
`;

const LeftAligned = styled.div`
  flex: 1;
  display: flex;
  gap: 10px;
`;

const LogoPlaceholder = styled(Button.Invisible)`
  padding: 0;
  font-size: 1.7rem;
  font-weight: bold;
  font-family: monospace;
`;

export default function NavBar() {
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    console.log('Logging out');
    setUser(null);
  };

  return (
    <StyledNav>
      <LeftAligned>
        <LogoPlaceholder onClick={() => navigate('/')}>[LOGO]</LogoPlaceholder>
      </LeftAligned>
      {user ? (
        <Button.Secondary onClick={handleLogout}>Log Out</Button.Secondary>
      ) : (
        <>
          <Button.Primary onClick={() => navigate('/signup')}>
            Sign Up
          </Button.Primary>
          <Button.Secondary onClick={() => navigate('/login')}>
            Login
          </Button.Secondary>
        </>
      )}
    </StyledNav>
  );
}
