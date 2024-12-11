import React from 'react';

import { XTHING, YTHING, ZTHING } from 'constants.js';
import { ATHING } from 'donstants.js';
import Home from 'pages/Home';
import { TESTTHING } from 'test/constants.js';

import { THING } from './constants';

const shoe = 10;

export default function FakeButton() {
  console.log('THING', THING);
  console.log('XTHING', XTHING);
  console.log('YTHING', YTHING);
  console.log('ZTHING', ZTHING);
  console.log('ATHING', ATHING);
  console.log('shoe', shoe);
  console.log('TESTTHING', TESTTHING);

  return (
    <>
      <button>SNoop dog</button>
      <Home />
    </>
  );
}
