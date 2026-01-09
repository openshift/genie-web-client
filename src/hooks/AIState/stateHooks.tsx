import {
  useInProgress as aiStateUseInProgress,
  useIsInitializing as aiStateUseIsInitializing,
} from '@redhat-cloud-services/ai-react-state';

export const useInProgress = () => {
  const inProgress = aiStateUseInProgress();
  return inProgress;
};

export const useIsInitializing = () => {
  const isInitializing = aiStateUseIsInitializing();
  return isInitializing;
};
