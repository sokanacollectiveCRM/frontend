
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

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <StyledNav>
      <LeftAligned>
        <Button className='w-25' onClick={() => navigate('/login')} variant="ghost">
          <img src="/logo.jpeg" alt="Logo" className="h-10 w-full" />
        </Button>
      </LeftAligned>
      <>
        <Button variant="ghost" onClick={() => navigate('/signup')}>
          Sign Up
        </Button>
        <Button variant="ghost" onClick={() => navigate('/login')}>
          Login
        </Button>
      </>
    </StyledNav>
  );
}
