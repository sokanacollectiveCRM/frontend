
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '@/common/components/ui/button';

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

const LogoPlaceholder = styled(Button)`
  padding: 0;
  font-size: 1.7rem;
  font-weight: bold;
  font-family: monospace;
`;

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <StyledNav>
      <LeftAligned>
        <LogoPlaceholder onClick={() => navigate('/')}>[LOGO]</LogoPlaceholder>
      </LeftAligned>
        <>
          <Button onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
        </>
    </StyledNav>
  );
}
