import React from 'react';

import { Title } from 'common/components/Text';

import { StyledButton, StyledPage } from './styles';

export default function SignUp() {
  return (
    <StyledPage>
      <Title>Sign Up</Title>
      <StyledButton>Submit</StyledButton>
    </StyledPage>
  );
}
