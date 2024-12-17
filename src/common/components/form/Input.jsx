import React, { useState } from 'react';

import { Icon } from 'assets/icons/icons';
import PropTypes from 'prop-types';

import {
  IconContainer,
  InputContainer,
  InputName,
  PasswordContainer,
  StyledInput,
} from './styles';

TitledInput.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
function TitledInput({ title, children }) {
  return (
    <InputContainer>
      <InputName>{title}</InputName>
      {children}
    </InputContainer>
  );
}

TextField.propTypes = {
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
function TextField({ handleChange, placeholder = 'Text' }) {
  return (
    <StyledInput
      type='text'
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}

InputText.propTypes = {
  title: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
function InputText({ title, handleChange, placeholder }) {
  return (
    <TitledInput title={title}>
      <TextField handleChange={handleChange} placeholder={placeholder} />
    </TitledInput>
  );
}

PasswordField.propTypes = {
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
function PasswordField({ handleChange, placeholder = '' }) {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PasswordContainer>
      <StyledInput
        type={showPassword ? 'text' : 'password'}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <IconContainer onClick={toggleShowPassword}>
        {showPassword ? <Icon.EyeClosed /> : <Icon.Eye />}
      </IconContainer>
    </PasswordContainer>
  );
}

InputPassword.propTypes = {
  title: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
function InputPassword({ title, handleChange, placeholder }) {
  return (
    <TitledInput title={title}>
      <PasswordField handleChange={handleChange} placeholder={placeholder} />
    </TitledInput>
  );
}

export const Input = {
  Text: InputText,
  Password: InputPassword,
};
