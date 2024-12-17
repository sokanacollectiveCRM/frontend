import React, { useState } from 'react';

import { Icon } from 'assets/icons/icons';
import { useNavigate } from 'react-router-dom';

import { Title } from 'common/components/Text';

import {
  IconContainer,
  PasswordContainer,
  StyledButton,
  StyledForm,
  StyledInput,
  StyledPage,
} from './styles';

export default function LogIn() {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeEmail = (e) => {
    setFormState({ ...formState, email: e.target.value });
  };

  const handleChangePassword = (e) => {
    setFormState({ ...formState, password: e.target.value });
  };

  const handleSubmit = (e) => {
    // prevent page refresh
    e.preventDefault();
    console.log('Submitted', formState);
    // navigate('/');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <StyledPage>
      <Title>Log In</Title>
      <StyledForm>
        <StyledInput
          type='text'
          onChange={handleChangeEmail}
          placeholder='Email'
        />
        <PasswordContainer>
          <StyledInput
            type={showPassword ? 'text' : 'password'}
            onChange={handleChangePassword}
            placeholder='Password'
          />
          <IconContainer onClick={toggleShowPassword}>
            {showPassword ? <Icon.EyeClosed /> : <Icon.Eye />}
          </IconContainer>
        </PasswordContainer>
        <StyledButton type='submit' onClick={handleSubmit}>
          Log In
        </StyledButton>
      </StyledForm>
    </StyledPage>
  );
}
