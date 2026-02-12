// Mock for @openshift-console/dynamic-plugin-sdk
module.exports = {
  k8sCreate: jest.fn().mockResolvedValue({}),
  k8sDelete: jest.fn().mockResolvedValue({}),
  k8sGet: jest.fn().mockResolvedValue({}),
  k8sUpdate: jest.fn().mockResolvedValue({}),
  useK8sWatchResource: jest.fn().mockReturnValue([[], true, null]),
};
