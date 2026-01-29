import { FC, ReactNode, useState, useCallback, useMemo } from 'react';
import { CreateModeContext, CreateModeContextValue } from './CreateModeContext';

interface CreateModeProviderProps {
  children: ReactNode;
}

export const CreateModeProvider: FC<CreateModeProviderProps> = ({ children }) => {
  const [isCreateModeActive, setIsCreateModeActive] = useState<boolean>(false);

  const setCreateModeActive = useCallback((active: boolean) => {
    setIsCreateModeActive(active);
  }, []);

  const contextValue = useMemo<CreateModeContextValue>(
    () => ({ isCreateModeActive, setCreateModeActive }),
    [isCreateModeActive, setCreateModeActive],
  );

  return <CreateModeContext.Provider value={contextValue}>{children}</CreateModeContext.Provider>;
};
