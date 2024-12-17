import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Form, FormTitle } from 'common/components/form/Form';
import { Input } from 'common/components/form/Input';
import SubmitButton from 'common/components/form/SubmitButton';

import { StyledPage } from './styles';

export default function LogIn() {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

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
    navigate('/');
  };

  return (
    <StyledPage>
      <Form>
        <FormTitle>Log In</FormTitle>
        <Input.Text
          title='Email'
          placeholder='j@example.com'
          handleChange={handleChangeEmail}
        />
        <Input.Password title='Password' handleChange={handleChangePassword} />
        <SubmitButton onClick={handleSubmit}>Log In</SubmitButton>
      </Form>
    </StyledPage>
  );
}
