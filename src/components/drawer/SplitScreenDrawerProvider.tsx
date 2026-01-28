import { FC, ReactNode, useState, useCallback, useMemo } from 'react';
import {
  SplitScreenDrawerConfig,
  SplitScreenDrawerState,
  SplitScreenDrawerContext,
} from './SplitScreenDrawerContext';

interface SplitScreenDrawerProviderProps {
  children: ReactNode;
}

export const SplitScreenDrawerProvider: FC<SplitScreenDrawerProviderProps> = ({ children }) => {
  const [splitScreenDrawerState, setSplitScreenDrawerState] = useState<SplitScreenDrawerState>({
    isOpen: false,
    children: null,
  });

  const openSplitScreenDrawer = useCallback((config: SplitScreenDrawerConfig) => {
    setSplitScreenDrawerState({
      isOpen: true,
      children: config.children,
      onClose: config.onClose,
    });
  }, []);

  const closeSplitScreenDrawer = useCallback(() => {
    setSplitScreenDrawerState((prevState) => {
      if (prevState.onClose) {
        prevState.onClose();
      }
      return {
        ...prevState,
        isOpen: false,
      };
    });
  }, []);

  const contextValue = useMemo(
    () => ({ splitScreenDrawerState, openSplitScreenDrawer, closeSplitScreenDrawer }),
    [splitScreenDrawerState, openSplitScreenDrawer, closeSplitScreenDrawer],
  );

  return (
    <SplitScreenDrawerContext.Provider value={contextValue}>
      {children}
    </SplitScreenDrawerContext.Provider>
  );
};
