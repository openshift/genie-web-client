import { createContext, useContext } from 'react';

export interface CreateModeContextValue {
  isCreateModeActive: boolean;
  setCreateModeActive: (active: boolean) => void;
}

export const CreateModeContext = createContext<CreateModeContextValue | undefined>(undefined);

export const useCreateMode = (): CreateModeContextValue => {
  const context = useContext(CreateModeContext);
  if (!context) {
    throw new Error('useCreateMode must be used within a CreateModeProvider');
  }
  return context;
};
