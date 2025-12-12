import { FC, ReactNode, useState, useCallback, useMemo } from 'react';
import { DrawerContext, DrawerConfig, DrawerState } from './DrawerContext';

interface DrawerProviderProps {
  children: ReactNode;
}

export const DrawerProvider: FC<DrawerProviderProps> = ({ children }) => {
  const [drawerState, setDrawerState] = useState<DrawerState>({
    isOpen: false,
    heading: null,
    icon: null,
    children: null,
    position: 'right',
  });

  const openDrawer = useCallback((config: DrawerConfig) => {
    setDrawerState({
      isOpen: true,
      heading: config.heading,
      icon: config.icon,
      children: config.children,
      position: config.position || 'right',
      onClose: config.onClose,
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerState((prevState) => {
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
    () => ({ drawerState, openDrawer, closeDrawer }),
    [drawerState, openDrawer, closeDrawer],
  );

  return <DrawerContext.Provider value={contextValue}>{children}</DrawerContext.Provider>;
};
