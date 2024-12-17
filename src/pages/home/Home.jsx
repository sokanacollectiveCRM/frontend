import React, { useContext } from 'react';

import styled from 'styled-components';

import { Subtitle, Title } from 'common/components/Text';
import { UserContext } from 'common/contexts/UserContext';

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
  padding-top: 100px;
`;

export default function Home() {
  const { user } = useContext(UserContext);

  return (
    <HomePage>
      <TextContainer>
        <Title>Home Page</Title>
        <Subtitle>You are {user ? '' : 'NOT'} logged in.</Subtitle>
      </TextContainer>
    </HomePage>
  );
}
