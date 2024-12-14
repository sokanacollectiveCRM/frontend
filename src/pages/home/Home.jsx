import React from 'react';

import styled from 'styled-components';

import { Subtitle, Title } from 'common/components/Text';

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HomePage = styled.div`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-top: 100px;
`;

export default function Home() {
  return (
    <HomePage>
      <TextContainer>
        <Title>Home Page</Title>
        <Subtitle>You are NOT logged in.</Subtitle>
      </TextContainer>
    </HomePage>
  );
}
