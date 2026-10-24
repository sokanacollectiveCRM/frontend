import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { AuthFormLogo } from '@/common/components/brand/Sokana360Logo';
import { Button } from '@/common/components/ui/button';

const StyledNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 20px;
  font-size: 20px;
`;

const LeftAligned = styled.div`
  flex: 1;
  display: flex;
  gap: 10px;
`;

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <StyledNav>
      <LeftAligned>
        <AuthFormLogo placement='header' />
      </LeftAligned>
      <Button variant='ghost' onClick={() => navigate('/login')}>
        Login
      </Button>
    </StyledNav>
  );
}
