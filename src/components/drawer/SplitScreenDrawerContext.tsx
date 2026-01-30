import { createContext, useContext, ReactNode } from 'react';

export interface SplitScreenDrawerConfig {
  children: ReactNode;
  position?: 'left' | 'right';
  onClose?: () => void;
}

export interface SplitScreenDrawerState extends SplitScreenDrawerConfig {
  isOpen: boolean;
}

export interface SplitScreenDrawerContextValue {
  splitScreenDrawerState: SplitScreenDrawerState;
  openSplitScreenDrawer: (config: SplitScreenDrawerConfig) => void;
  closeSplitScreenDrawer: () => void;
}

export const SplitScreenDrawerContext = createContext<SplitScreenDrawerContextValue | undefined>(
  undefined,
);

export const useSplitScreenDrawer = (): SplitScreenDrawerContextValue => {
  const context = useContext(SplitScreenDrawerContext);
  if (!context) {
    throw new Error('useSplitScreenDrawer must be used within a SplitScreenDrawerProvider');
  }
  return context;
};
