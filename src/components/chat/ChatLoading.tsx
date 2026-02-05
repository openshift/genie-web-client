import { Skeleton } from '@patternfly/react-core';

export const ChatLoading = () => {
  return (
    <>
      <Skeleton screenreaderText="Loading conversation" />
      <Skeleton className="pf-v6-u-mt-md" width="75%" />
      <Skeleton className="pf-v6-u-mt-md" width="66%" />
    </>
  );
};
