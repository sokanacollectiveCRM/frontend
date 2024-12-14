import React from 'react';

import styled from 'styled-components';

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.p`
  font-size: 2.5em;
  font-weight: bold;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 1.5em;
  margin: 0;
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
        <Title>Welcome to the Home Page</Title>
        <Subtitle>You are NOT logged in.</Subtitle>
      </TextContainer>
    </HomePage>
  );
}
