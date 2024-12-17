import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Title } from 'common/components/Text';

import { StyledButton, StyledForm, StyledInput, StyledPage } from './styles';

export default function SignUp() {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });

  const handleChangeFirstname = (e) => {
    setFormState({ ...formState, firstname: e.target.value });
  };
  const handleChangeLastname = (e) => {
    setFormState({ ...formState, lastname: e.target.value });
  };
  const handleChangeEmail = (e) => {
    setFormState({ ...formState, username: e.target.value });
  };
  const handleChangePassword = (e) => {
    setFormState({ ...formState, password: e.target.value });
  };

  const handleSubmit = (e) => {
    // prevent page refresh
    e.preventDefault();
    console.log('Submitted', formState);
    navigate('/');
  };

  return (
    <StyledPage>
      <Title>Sign Up</Title>
      <StyledForm>
        <StyledInput
          type='text'
          onChange={handleChangeFirstname}
          placeholder='First Name'
        />
        <StyledInput
          type='text'
          onChange={handleChangeLastname}
          placeholder='Last Name'
        />
        <StyledInput
          type='text'
          onChange={handleChangeEmail}
          placeholder='Email'
        />
        <StyledInput
          type='password'
          onChange={handleChangePassword}
          placeholder='Password'
        />
        <StyledButton type='submit' onClick={handleSubmit}>
          Sign Up
        </StyledButton>
      </StyledForm>
    </StyledPage>
  );
}
