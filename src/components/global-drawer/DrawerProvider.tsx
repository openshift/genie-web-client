import * as React from 'react';
import { DrawerContext, DrawerConfig } from './DrawerContext';
import { GlobalDrawer } from './GlobalDrawer';

interface DrawerState {
  isOpen: boolean;
  heading: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  position: 'left' | 'right';
  onClose?: () => void;
}

interface DrawerProviderProps {
  children: React.ReactNode;
}

export const DrawerProvider: React.FC<DrawerProviderProps> = ({ children }) => {
  const [drawerState, setDrawerState] = React.useState<DrawerState>({
    isOpen: false,
    heading: null,
    icon: null,
    children: null,
    position: 'right',
  });

  const openDrawer = React.useCallback((config: DrawerConfig) => {
    setDrawerState({
      isOpen: true,
      heading: config.heading,
      icon: config.icon,
      children: config.children,
      position: config.position || 'right',
      onClose: config.onClose,
    });
  }, []);

  const closeDrawer = React.useCallback(() => {
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

  const contextValue = React.useMemo(
    () => ({ openDrawer, closeDrawer }),
    [openDrawer, closeDrawer]
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
      <GlobalDrawer
        isOpen={drawerState.isOpen}
        heading={drawerState.heading}
        icon={drawerState.icon}
        position={drawerState.position}
        onClose={closeDrawer}
      >
        {drawerState.children}
      </GlobalDrawer>
    </DrawerContext.Provider>
  );
};

