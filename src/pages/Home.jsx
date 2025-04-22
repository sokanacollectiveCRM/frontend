
import styled from 'styled-components';

import { Subtitle, Title } from '@/common/components/Text';
import UsersList from '@/common/components/user/UsersList';

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
        <Title>Home Page</Title>
        <Subtitle>Welcome, {user?.firstname || 'User'}!</Subtitle>
      </TextContainer>
      <UsersList />
    </HomePage>
  );
}
