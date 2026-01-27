import { FC, ReactNode, useState, useCallback, useMemo } from 'react';
import { DrawerContext, DrawerConfig, DrawerState } from './DrawerContext';

interface DrawerProviderProps {
  children: ReactNode;
}

export const DrawerProvider: FC<DrawerProviderProps> = ({ children }) => {
  const [drawerState, setDrawerState] = useState<DrawerState>({
    isOpen: false,
    id: undefined,
    heading: null,
    icon: null,
    children: null,
    position: 'right',
  });

  const openDrawer = useCallback((config: DrawerConfig) => {
    setDrawerState((prevState) => {
      // If the same drawer is already open, close it (toggle behavior)
      if (prevState.isOpen && prevState.id && prevState.id === config.id) {
        if (prevState.onClose) {
          prevState.onClose();
        }
        return {
          ...prevState,
          isOpen: false,
        };
      }
      // Otherwise, open the new drawer (replacing any currently open drawer)
      if (prevState.isOpen && prevState.onClose) {
        prevState.onClose();
      }
      return {
        isOpen: true,
        id: config.id,
        heading: config.heading,
        icon: config.icon,
        children: config.children,
        position: config.position || 'right',
        onClose: config.onClose,
      };
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
