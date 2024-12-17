import React from 'react';

import PropTypes from 'prop-types';

import { StyledButton } from './styles';

SubmitButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default function SubmitButton({ children, onClick }) {
  return (
    <StyledButton type='submit' onClick={onClick}>
      {children}
    </StyledButton>
  );
}
