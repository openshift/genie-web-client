import { createContext, useContext, ReactNode } from 'react';

export interface DrawerConfig {
  id?: string;
  heading: ReactNode;
  icon: ReactNode;
  children: ReactNode;
  position?: 'left' | 'right';
  onClose?: () => void;
}

export interface DrawerState extends DrawerConfig {
  isOpen: boolean;
}

export interface DrawerContextValue {
  drawerState: DrawerState;
  openDrawer: (config: DrawerConfig) => void;
  closeDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextValue | undefined>(undefined);

export const useDrawer = (): DrawerContextValue => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
