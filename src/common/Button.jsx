import React from 'react';

import { DONTEXIST, GLOBALTHING, ewstinkie } from 'constants.js';
import PropTypes from 'prop-types';
import { TESTTHING } from 'test/constants';

import { THING } from './constants';

Button.propTypes = {
  children: PropTypes.node,
};

export default function Button({ children }) {
  console.log('THING', THING);
  console.log('DONTEXIST', DONTEXIST);
  console.log('GLOBALTHING', GLOBALTHING);
  console.log('ewstinkie', ewstinkie);
  console.log('TESTTHING', TESTTHING);

  return <button>{children}</button>;
}
