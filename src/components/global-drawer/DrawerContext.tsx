import * as React from 'react';

export interface DrawerConfig {
  heading: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
  onClose?: () => void;
}

export interface DrawerContextValue {
  openDrawer: (config: DrawerConfig) => void;
  closeDrawer: () => void;
}

export const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);

export const useDrawer = (): DrawerContextValue => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

