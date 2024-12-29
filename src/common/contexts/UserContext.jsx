import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

export const UserContext = React.createContext({
  user: null,
  setUser: () => {},
  isLoading: false,
  logout: () => {},
  checkAuth: () => {},
});

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      await checkAuth();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/logout`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const googleAuth = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/google`,
        {
          credentials: 'include',
        }
      );
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error('Failed to initialize Google authentication');
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset request failed');
      }

      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const updatePassword = async (password, accessToken) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/auth/reset-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password update failed');
      }

      return true;
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue = {
    user,
    setUser,
    isLoading,
    login,
    logout,
    checkAuth,
    googleAuth,
    requestPasswordReset,
    updatePassword,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
