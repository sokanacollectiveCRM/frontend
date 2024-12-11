import React from 'react';

import Home from 'pages/home/Home';

const shoe = 10;

export default function FakeButton() {
  console.log('shoe', shoe);
  return (
    <>
      <button>SNoop dog</button>
      <Home />
    </>
  );
}
