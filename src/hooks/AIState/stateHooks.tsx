import {
  useInProgress as aiStateUseInProgress,
  useIsInitializing as aiStateUseIsInitializing,
  useStreamChunk as aiStateUseStreamChunk,
} from '@redhat-cloud-services/ai-react-state';
import type { IStreamChunk } from './types';

export const useInProgress = (): boolean => {
  const inProgress = aiStateUseInProgress();
  return inProgress;
};

export const useIsInitializing = (): boolean => {
  const isInitializing = aiStateUseIsInitializing();
  return isInitializing;
};

export const useStreamChunk = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(): IStreamChunk<T> | undefined => {
  const streamChunk = aiStateUseStreamChunk<T>();
  return streamChunk;
};