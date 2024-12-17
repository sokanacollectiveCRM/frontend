import React, { useState } from 'react';

import PropTypes from 'prop-types';

export const UserContext = React.createContext({
  user: {},
  setUser: () => {},
});

const DUMMY_USER = {
  userid: '1',
  firstname: 'Harry',
  lastname: 'Styles',
  email: 'harry@styles.com',
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export function UserProvider({ children }) {
  const [user, setUser] = useState(DUMMY_USER);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
