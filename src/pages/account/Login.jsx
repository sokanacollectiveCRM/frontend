import React from 'react';

import { Title } from 'common/components/Text';

import { StyledButton, StyledPage } from './styles';

export default function LogIn() {
  return (
    <StyledPage>
      <Title>Log In</Title>
      <StyledButton>Submit</StyledButton>
    </StyledPage>
  );
}
