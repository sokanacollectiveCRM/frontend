import React from 'react';

import Button from 'common/Button';
import { THING } from 'common/constants';

export default function Home() {
  console.log('THING', THING);

  return (
    <>
      <h1>Home</h1>
      <Button>Hehe</Button>
    </>
  );
}
