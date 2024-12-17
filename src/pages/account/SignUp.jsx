import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Form, FormTitle } from 'common/components/form/Form';
import { Input } from 'common/components/form/Input';
import SubmitButton from 'common/components/form/SubmitButton';

import { StyledPage } from './styles';

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
        <FormTitle>Create an account</FormTitle>
        <Input.Text
          title='First name'
          placeholder='John'
          handleChange={handleChangeFirstname}
        />
        <Input.Text
          title='Last name'
          placeholder='Smith'
          handleChange={handleChangeLastname}
        />
        <Input.Text
          title='Email'
          placeholder='j@example.com'
          handleChange={handleChangeEmail}
        />
        <Input.Password title='Password' handleChange={handleChangePassword} />
        <SubmitButton onClick={handleSubmit}>Sign Up</SubmitButton>
      </Form>
    </StyledPage>
  );
}
