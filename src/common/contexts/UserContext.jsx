import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

export const UserContext = React.createContext({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/auth/me`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Auth check failed');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
