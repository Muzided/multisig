import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EscrowContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export const EscrowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <EscrowContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </EscrowContext.Provider>
  );
};

export const useEscrowRefresh = () => {
  const context = useContext(EscrowContext);
  if (context === undefined) {
    throw new Error('useEscrowRefresh must be used within an EscrowProvider');
  }
  return context;
}; 