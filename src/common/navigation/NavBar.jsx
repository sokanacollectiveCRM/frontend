import React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const ButtonPrimary = styled.button`
  background-color: var(--primary-green);
  font-size: 0.8em;
  padding: 5px 20px;
  border-radius: 5px;
  border: solid 1px var(--primary-green);
  color: var(--white);
`;

const ButtonSecondary = styled.button`
  background-color: var(--secondary-lightgrey);
  font-size: 0.8em;
  padding: 5px 20px;
  border-radius: 5px;
  border: solid 1px var(--text);
`;

const ButtonTransparent = styled.button`
  background-color: transparent;
  font-size: 0.8em;
  padding: 5px 20px;
  border-radius: 5px;
`;

const StyledLogo = styled.div`
  font-size: 2.3rem;
  font-weight: bold;
  font-family: monospace;
  height: 39px;
`;

function Logo() {
  return <StyledLogo>LOGO</StyledLogo>;
}

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
        <Logo onClick={handleHomeNav} />
      </LeftAligned>
      <ButtonPrimary onClick={handleSignupNav}>Sign Up</ButtonPrimary>
      <ButtonSecondary onClick={handleLoginNav}>Login</ButtonSecondary>
    </StyledNav>
  );
}
