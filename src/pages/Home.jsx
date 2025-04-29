import UsersList from '@/common/components/user/UsersList';
import { useUser } from '@/common/hooks/useUser';
import styled from 'styled-components';

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HomePage = styled.div`
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
`;

export default function Home() {
  const { user } = useUser();

  return (
    <HomePage>
      <TextContainer>
        <h1>Home Page</h1>
        <h2>Welcome, {user?.firstname || 'User'}!</h2>
      </TextContainer>
      <UsersList />
    </HomePage>
  );
}
