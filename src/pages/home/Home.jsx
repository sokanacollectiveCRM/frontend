import React from 'react';

import styled from 'styled-components';

const Text = styled.p`
  font-size: 2.5em;
  font-weight: bold;
  color: var(--text);
`;

const HomePage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default function Home() {
  return (
    <HomePage>
      <Text>Welcome to the Home Page</Text>
    </HomePage>
  );
}
