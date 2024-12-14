import React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from 'common/components/Button';

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

  const handleHomeNav = () => {
    navigate('/');
  };

  const handleLoginNav = () => {
    navigate('/login');
  };

  const handleSignupNav = () => {
    navigate('/signup');
  };

  return (
    <StyledNav>
      <LeftAligned>
        <LogoPlaceholder onClick={handleHomeNav}>[LOGO]</LogoPlaceholder>
      </LeftAligned>
      <Button.Primary onClick={handleSignupNav}>Sign Up</Button.Primary>
      <Button.Secondary onClick={handleLoginNav}>Login</Button.Secondary>
    </StyledNav>
  );
}
