import React from 'react';

import PropTypes from 'prop-types';

Button.propTypes = {
  children: PropTypes.node,
};

export default function Button({ children }) {
  return <button>{children}</button>;
}
