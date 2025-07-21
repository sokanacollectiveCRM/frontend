import { useTemplates } from '@/common/hooks/contracts/useTemplates';
import React, { createContext, useContext, useEffect } from 'react';

const TemplatesContext = createContext<ReturnType<typeof useTemplates> | null>(
  null
);

export const TemplatesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useTemplates();

  useEffect(() => {
    value.getTemplates();
  }, []);

  return (
    <TemplatesContext.Provider value={value}>
      {children}
    </TemplatesContext.Provider>
  );
};

export const useTemplatesContext = () => {
  const context = useContext(TemplatesContext);
  if (!context)
    throw new Error('useTemplates must be used within TemplatesProvider');
  return context;
};
