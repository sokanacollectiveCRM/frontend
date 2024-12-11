import React from 'react';

import { DONTEXIST, GLOBALTHING, ewstinkie } from 'constants.js';
import { TESTTHING } from 'test/constants';

import { THING } from './constants';

export default function Button({ children }) {
  console.log('THING', THING);
  console.log('DONTEXIST', DONTEXIST);
  console.log('GLOBALTHING', GLOBALTHING);
  console.log('ewstinkie', ewstinkie);
  console.log('TESTTHING', TESTTHING);

  return <button>{children}</button>;
}
