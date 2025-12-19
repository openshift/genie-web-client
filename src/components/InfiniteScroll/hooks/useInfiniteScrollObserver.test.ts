import { renderHook } from '../../../unitTestUtils';
import { useInfiniteScrollObserver } from './useInfiniteScrollObserver';

describe('useInfiniteScrollObserver', () => {
  const mockIncreasePage = jest.fn();
  let storedCallback: ((entries: IntersectionObserverEntry[]) => void) | undefined;
  let mockObserve: ReturnType<typeof jest.fn>;
  let mockDisconnect: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    jest.clearAllMocks();
    storedCallback = undefined;
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();

    // Override the IntersectionObserver mock from setup.ts to capture callback
    // Make it a proper class constructor
    global.IntersectionObserver = class IntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      constructor(callback: IntersectionObserverCallback) {
        storedCallback = callback as (entries: IntersectionObserverEntry[]) => void;
      }
    } as never;
  });

  it('should return a ref callback function', () => {
    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, true, mockIncreasePage),
    );

    expect(typeof result.current).toBe('function');
  });

  it('should create IntersectionObserver when node is provided and conditions are met', () => {
    const constructorSpy = jest.fn();
    global.IntersectionObserver = class IntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      constructor(callback: IntersectionObserverCallback) {
        constructorSpy();
        storedCallback = callback as (entries: IntersectionObserverEntry[]) => void;
      }
    } as never;

    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, true, mockIncreasePage),
    );

    const node = document.createElement('div');
    result.current(node);

    expect(constructorSpy).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledWith(node);
  });

  it('should not observe if isLoading is true', () => {
    jest.clearAllMocks();
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    global.IntersectionObserver = class IntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      constructor(callback: IntersectionObserverCallback) {
        storedCallback = callback as (entries: IntersectionObserverEntry[]) => void;
      }
    } as never;

    const { result } = renderHook(() =>
      useInfiniteScrollObserver(true, false, true, mockIncreasePage),
    );

    const node = document.createElement('div');
    result.current(node);

    // Should not create observer when conditions aren't met
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should not observe if endOfData is true', () => {
    jest.clearAllMocks();
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    global.IntersectionObserver = class IntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      constructor(callback: IntersectionObserverCallback) {
        storedCallback = callback as (entries: IntersectionObserverEntry[]) => void;
      }
    } as never;

    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, true, true, mockIncreasePage),
    );

    const node = document.createElement('div');
    result.current(node);

    // Should not create observer when conditions aren't met
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should not observe if isInfiniteScrollEnabled is false', () => {
    jest.clearAllMocks();
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    global.IntersectionObserver = class IntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      constructor(callback: IntersectionObserverCallback) {
        storedCallback = callback as (entries: IntersectionObserverEntry[]) => void;
      }
    } as never;

    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, false, mockIncreasePage),
    );

    const node = document.createElement('div');
    result.current(node);

    // Should not create observer when conditions aren't met
    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should call increasePage when intersection occurs', () => {
    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, true, mockIncreasePage),
    );

    const node = document.createElement('div');
    result.current(node);

    // Simulate intersection using stored callback
    if (storedCallback) {
      storedCallback([
        {
          isIntersecting: true,
          target: node,
        } as unknown as IntersectionObserverEntry,
      ]);
    }

    expect(mockIncreasePage).toHaveBeenCalledTimes(1);
  });

  it('should disconnect existing observer before creating new one', () => {
    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, true, mockIncreasePage),
    );

    const node1 = document.createElement('div');
    result.current(node1);

    jest.clearAllMocks();
    const node2 = document.createElement('div');
    result.current(node2);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should not observe if node is null', () => {
    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, true, mockIncreasePage),
    );

    result.current(null);

    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should not observe if loadingDataErrorMessage is provided', () => {
    jest.clearAllMocks();
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();
    global.IntersectionObserver = class IntersectionObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
      constructor(callback: IntersectionObserverCallback) {
        storedCallback = callback as (entries: IntersectionObserverEntry[]) => void;
      }
    } as never;

    const { result } = renderHook(() =>
      useInfiniteScrollObserver(false, false, true, mockIncreasePage, 'Error loading data'),
    );

    const node = document.createElement('div');
    result.current(node);

    // Should not create observer when there is an error
    expect(mockObserve).not.toHaveBeenCalled();
  });
});
