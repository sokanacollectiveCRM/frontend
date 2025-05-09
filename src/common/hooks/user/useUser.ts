import { UserContext } from '@/common/contexts/UserContext';
import type { UserContextType } from '@/common/types/auth';
import { useContext } from 'react';

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
