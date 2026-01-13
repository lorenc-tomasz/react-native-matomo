// Mock must be set up before any imports - Jest hoists this
jest.mock('react-native', () => ({
  NativeModules: {
    ReactNativeMatomo: {
      initialize: jest.fn().mockResolvedValue(undefined),
      isInitialized: jest.fn().mockResolvedValue(true),
      trackView: jest.fn().mockResolvedValue(undefined),
      trackEvent: jest.fn().mockResolvedValue(undefined),
      trackGoal: jest.fn().mockResolvedValue(undefined),
      trackAppDownload: jest.fn().mockResolvedValue(undefined),
      trackSiteSearch: jest.fn().mockResolvedValue(undefined),
      setCustomDimension: jest.fn().mockResolvedValue(undefined),
      setUserId: jest.fn().mockResolvedValue(undefined),
      setAppOptOut: jest.fn().mockResolvedValue(undefined),
      isOptOut: jest.fn().mockResolvedValue(false),
      dispatch: jest.fn().mockResolvedValue(undefined),
      setDispatchInterval: jest.fn().mockResolvedValue(undefined),
      getDispatchInterval: jest.fn().mockResolvedValue(30),
      reset: jest.fn().mockResolvedValue(undefined),
      resetCustomDimensions: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      getUserId: jest.fn().mockResolvedValue('user123'),
      startNewSession: jest.fn().mockResolvedValue(undefined),
    },
  },
  Platform: {
    OS: 'ios',
    select: (obj: { ios?: unknown; default?: unknown }) => obj.ios ?? obj.default,
  },
}));

// Now import the module - it will use our mocked react-native
import { NativeModules } from 'react-native';
import {
  MatomoTracker,
  initialize,
  isInitialized,
  trackView,
  trackEvent,
  trackGoal,
  trackAppDownload,
  trackSiteSearch,
  setCustomDimension,
  setUserId,
  setAppOptOut,
  isOptOut,
  dispatch,
  setDispatchInterval,
  getDispatchInterval,
  reset,
  resetCustomDimensions,
  stop,
  getUserId,
  startNewSession,
} from '../index';

// Get reference to the mocked native module
const mockNativeModule = NativeModules.ReactNativeMatomo;

describe('MatomoTracker Class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default instance ID', () => {
      const tracker = new MatomoTracker();
      expect(tracker.getInstanceId()).toBe('default');
    });

    it('should create instance with custom instance ID', () => {
      const tracker = new MatomoTracker('custom-tracker');
      expect(tracker.getInstanceId()).toBe('custom-tracker');
    });

    it('should allow multiple instances with different IDs', () => {
      const tracker1 = new MatomoTracker('tracker1');
      const tracker2 = new MatomoTracker('tracker2');

      expect(tracker1.getInstanceId()).toBe('tracker1');
      expect(tracker2.getInstanceId()).toBe('tracker2');
    });
  });

  describe('initialize', () => {
    it('should call native initialize with correct parameters on iOS', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initialize('https://matomo.example.com/matomo.php', 1, true);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://matomo.example.com/matomo.php',
        1,
        true
      );
    });

    it('should normalize URL by removing trailing slash', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initialize('https://matomo.example.com/', 1);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://matomo.example.com',
        1,
        false
      );
    });

    it('should default cachedQueue to false on iOS', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initialize('https://matomo.example.com', 1);

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://matomo.example.com',
        1,
        false
      );
    });
  });

  describe('initializeWithOptions', () => {
    it('should call initialize with options object', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initializeWithOptions({
        apiUrl: 'https://analytics.example.com/matomo.php',
        siteId: 5,
        cachedQueue: true,
      });

      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://analytics.example.com/matomo.php',
        5,
        true
      );
    });
  });

  describe('isInitialized', () => {
    it('should check if tracker is initialized', async () => {
      const tracker = new MatomoTracker('test');
      const result = await tracker.isInitialized();

      expect(mockNativeModule.isInitialized).toHaveBeenCalledWith('test');
      expect(result).toBe(true);
    });
  });

  describe('trackView', () => {
    it('should track view with route and title', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackView('/home', 'Home Screen');

      expect(mockNativeModule.trackView).toHaveBeenCalledWith(
        'test',
        '/home',
        'Home Screen'
      );
    });

    it('should track view with route only', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackView('/settings');

      expect(mockNativeModule.trackView).toHaveBeenCalledWith(
        'test',
        '/settings',
        undefined
      );
    });
  });

  describe('trackEvent', () => {
    it('should track event with all parameters', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackEvent(
        'User',
        'Click',
        'Button',
        100,
        'https://example.com/action'
      );

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith('test', 'User', 'Click', {
        name: 'Button',
        value: 100,
        url: 'https://example.com/action',
      });
    });

    it('should track event with required parameters only', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackEvent('Navigation', 'Swipe');

      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
        'test',
        'Navigation',
        'Swipe',
        {
          name: undefined,
          value: undefined,
          url: undefined,
        }
      );
    });
  });

  describe('trackGoal', () => {
    it('should track goal with revenue', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackGoal(1, 99.99);

      expect(mockNativeModule.trackGoal).toHaveBeenCalledWith('test', 1, {
        revenue: 99.99,
      });
    });

    it('should track goal without revenue', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackGoal(2);

      expect(mockNativeModule.trackGoal).toHaveBeenCalledWith('test', 2, {
        revenue: undefined,
      });
    });
  });

  describe('trackAppDownload', () => {
    it('should track app download', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackAppDownload();

      expect(mockNativeModule.trackAppDownload).toHaveBeenCalledWith('test');
    });
  });

  describe('trackSiteSearch', () => {
    it('should track site search with all parameters', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackSiteSearch('react native', 'tutorials', 25);

      expect(mockNativeModule.trackSiteSearch).toHaveBeenCalledWith(
        'test',
        'react native',
        'tutorials',
        25
      );
    });

    it('should track site search with query only', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.trackSiteSearch('matomo');

      expect(mockNativeModule.trackSiteSearch).toHaveBeenCalledWith(
        'test',
        'matomo',
        undefined,
        undefined
      );
    });
  });

  describe('setCustomDimension', () => {
    it('should set custom dimension with value', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setCustomDimension(1, 'premium');

      expect(mockNativeModule.setCustomDimension).toHaveBeenCalledWith(
        'test',
        1,
        'premium'
      );
    });

    it('should remove custom dimension with null', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setCustomDimension(1, null);

      expect(mockNativeModule.setCustomDimension).toHaveBeenCalledWith(
        'test',
        1,
        null
      );
    });
  });

  describe('setUserId', () => {
    it('should set user ID', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setUserId('user-123-abc');

      expect(mockNativeModule.setUserId).toHaveBeenCalledWith('test', 'user-123-abc');
    });

    it('should clear user ID with null', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setUserId(null);

      expect(mockNativeModule.setUserId).toHaveBeenCalledWith('test', null);
    });
  });

  describe('setAppOptOut', () => {
    it('should opt out of tracking', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setAppOptOut(true);

      expect(mockNativeModule.setAppOptOut).toHaveBeenCalledWith('test', true);
    });

    it('should opt in to tracking', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setAppOptOut(false);

      expect(mockNativeModule.setAppOptOut).toHaveBeenCalledWith('test', false);
    });
  });

  describe('isOptOut', () => {
    it('should return opt-out status', async () => {
      const tracker = new MatomoTracker('test');
      const result = await tracker.isOptOut();

      expect(mockNativeModule.isOptOut).toHaveBeenCalledWith('test');
      expect(result).toBe(false);
    });

    it('should return true when opted out', async () => {
      mockNativeModule.isOptOut.mockResolvedValueOnce(true);
      const tracker = new MatomoTracker('test');
      const result = await tracker.isOptOut();

      expect(result).toBe(true);
    });
  });

  describe('dispatch', () => {
    it('should dispatch events', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.dispatch();

      expect(mockNativeModule.dispatch).toHaveBeenCalledWith('test');
    });
  });

  describe('setDispatchInterval', () => {
    it('should set dispatch interval', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.setDispatchInterval(60);

      expect(mockNativeModule.setDispatchInterval).toHaveBeenCalledWith('test', 60);
    });

    it('should throw error for zero interval', async () => {
      const tracker = new MatomoTracker('test');

      await expect(tracker.setDispatchInterval(0)).rejects.toThrow(
        'Invalid interval. The value must be a positive number.'
      );
    });

    it('should throw error for negative interval', async () => {
      const tracker = new MatomoTracker('test');

      await expect(tracker.setDispatchInterval(-10)).rejects.toThrow(
        'Invalid interval. The value must be a positive number.'
      );
    });

    it('should throw error for non-number interval', async () => {
      const tracker = new MatomoTracker('test');

      await expect(
        tracker.setDispatchInterval('30' as unknown as number)
      ).rejects.toThrow('Invalid interval. The value must be a positive number.');
    });
  });

  describe('getDispatchInterval', () => {
    it('should return dispatch interval', async () => {
      const tracker = new MatomoTracker('test');
      const result = await tracker.getDispatchInterval();

      expect(mockNativeModule.getDispatchInterval).toHaveBeenCalledWith('test');
      expect(result).toBe(30);
    });
  });

  describe('reset', () => {
    it('should reset tracker', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.reset();

      expect(mockNativeModule.reset).toHaveBeenCalledWith('test');
    });
  });

  describe('resetCustomDimensions', () => {
    it('should reset custom dimensions', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.resetCustomDimensions();

      expect(mockNativeModule.resetCustomDimensions).toHaveBeenCalledWith('test');
    });
  });

  describe('stop', () => {
    it('should stop tracker without dispatching', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.stop();

      expect(mockNativeModule.stop).toHaveBeenCalledWith('test', false);
    });

    it('should stop tracker with dispatching remaining events', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.stop({ dispatchRemaining: true });

      expect(mockNativeModule.stop).toHaveBeenCalledWith('test', true);
    });

    it('should stop tracker with explicit dispatchRemaining false', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.stop({ dispatchRemaining: false });

      expect(mockNativeModule.stop).toHaveBeenCalledWith('test', false);
    });
  });

  describe('getUserId', () => {
    it('should return user ID', async () => {
      const tracker = new MatomoTracker('test');
      const result = await tracker.getUserId();

      expect(mockNativeModule.getUserId).toHaveBeenCalledWith('test');
      expect(result).toBe('user123');
    });

    it('should return null when no user ID set', async () => {
      mockNativeModule.getUserId.mockResolvedValueOnce(null);
      const tracker = new MatomoTracker('test');
      const result = await tracker.getUserId();

      expect(result).toBeNull();
    });
  });

  describe('startNewSession', () => {
    it('should start new session', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.startNewSession();

      expect(mockNativeModule.startNewSession).toHaveBeenCalledWith('test');
    });
  });
});

describe('Legacy API (backward compatibility)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default instance', async () => {
    await initialize('https://matomo.example.com', 1);

    expect(mockNativeModule.initialize).toHaveBeenCalledWith(
      'default',
      'https://matomo.example.com',
      1,
      false
    );
  });

  it('should check initialization status', async () => {
    const result = await isInitialized();

    expect(mockNativeModule.isInitialized).toHaveBeenCalledWith('default');
    expect(result).toBe(true);
  });

  it('should track view', async () => {
    await trackView('/page', 'Page Title');

    expect(mockNativeModule.trackView).toHaveBeenCalledWith(
      'default',
      '/page',
      'Page Title'
    );
  });

  it('should track event', async () => {
    await trackEvent('Category', 'Action', 'Label', 50);

    expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
      'default',
      'Category',
      'Action',
      {
        name: 'Label',
        value: 50,
        url: undefined,
      }
    );
  });

  it('should track goal', async () => {
    await trackGoal(1, 100);

    expect(mockNativeModule.trackGoal).toHaveBeenCalledWith('default', 1, {
      revenue: 100,
    });
  });

  it('should track app download', async () => {
    await trackAppDownload();

    expect(mockNativeModule.trackAppDownload).toHaveBeenCalledWith('default');
  });

  it('should track site search', async () => {
    await trackSiteSearch('query', 'category', 5);

    expect(mockNativeModule.trackSiteSearch).toHaveBeenCalledWith(
      'default',
      'query',
      'category',
      5
    );
  });

  it('should set custom dimension', async () => {
    await setCustomDimension(1, 'value');

    expect(mockNativeModule.setCustomDimension).toHaveBeenCalledWith(
      'default',
      1,
      'value'
    );
  });

  it('should set user ID', async () => {
    await setUserId('user-456');

    expect(mockNativeModule.setUserId).toHaveBeenCalledWith('default', 'user-456');
  });

  it('should set app opt out', async () => {
    await setAppOptOut(true);

    expect(mockNativeModule.setAppOptOut).toHaveBeenCalledWith('default', true);
  });

  it('should get opt out status', async () => {
    const result = await isOptOut();

    expect(mockNativeModule.isOptOut).toHaveBeenCalledWith('default');
    expect(result).toBe(false);
  });

  it('should dispatch events', async () => {
    await dispatch();

    expect(mockNativeModule.dispatch).toHaveBeenCalledWith('default');
  });

  it('should set dispatch interval', async () => {
    await setDispatchInterval(45);

    expect(mockNativeModule.setDispatchInterval).toHaveBeenCalledWith('default', 45);
  });

  it('should get dispatch interval', async () => {
    const result = await getDispatchInterval();

    expect(mockNativeModule.getDispatchInterval).toHaveBeenCalledWith('default');
    expect(result).toBe(30);
  });

  it('should reset tracker', async () => {
    await reset();

    expect(mockNativeModule.reset).toHaveBeenCalledWith('default');
  });

  it('should reset custom dimensions', async () => {
    await resetCustomDimensions();

    expect(mockNativeModule.resetCustomDimensions).toHaveBeenCalledWith('default');
  });

  it('should stop tracker', async () => {
    await stop({ dispatchRemaining: true });

    expect(mockNativeModule.stop).toHaveBeenCalledWith('default', true);
  });

  it('should get user ID', async () => {
    const result = await getUserId();

    expect(mockNativeModule.getUserId).toHaveBeenCalledWith('default');
    expect(result).toBe('user123');
  });

  it('should start new session', async () => {
    await startNewSession();

    expect(mockNativeModule.startNewSession).toHaveBeenCalledWith('default');
  });
});

describe('Multiple Tracker Instances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track events to different instances independently', async () => {
    const productionTracker = new MatomoTracker('production');
    const debugTracker = new MatomoTracker('debug');

    await productionTracker.initialize('https://prod.example.com', 1);
    await debugTracker.initialize('https://debug.example.com', 2);

    expect(mockNativeModule.initialize).toHaveBeenCalledTimes(2);
    expect(mockNativeModule.initialize).toHaveBeenNthCalledWith(
      1,
      'production',
      'https://prod.example.com',
      1,
      false
    );
    expect(mockNativeModule.initialize).toHaveBeenNthCalledWith(
      2,
      'debug',
      'https://debug.example.com',
      2,
      false
    );
  });

  it('should track events to correct instances', async () => {
    const tracker1 = new MatomoTracker('tracker1');
    const tracker2 = new MatomoTracker('tracker2');

    await tracker1.trackEvent('Category1', 'Action1');
    await tracker2.trackEvent('Category2', 'Action2');

    expect(mockNativeModule.trackEvent).toHaveBeenNthCalledWith(
      1,
      'tracker1',
      'Category1',
      'Action1',
      { name: undefined, value: undefined, url: undefined }
    );
    expect(mockNativeModule.trackEvent).toHaveBeenNthCalledWith(
      2,
      'tracker2',
      'Category2',
      'Action2',
      { name: undefined, value: undefined, url: undefined }
    );
  });

  it('should allow stopping individual tracker instances', async () => {
    const tracker1 = new MatomoTracker('tracker1');
    const tracker2 = new MatomoTracker('tracker2');

    await tracker1.stop({ dispatchRemaining: true });

    expect(mockNativeModule.stop).toHaveBeenCalledWith('tracker1', true);
    expect(mockNativeModule.stop).toHaveBeenCalledTimes(1);

    // tracker2 should still be usable
    await tracker2.trackView('/test');
    expect(mockNativeModule.trackView).toHaveBeenCalledWith('tracker2', '/test', undefined);
  });
});

describe('URL Normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove trailing slash from URL', async () => {
    const tracker = new MatomoTracker('test');
    await tracker.initialize('https://example.com/matomo/', 1);

    expect(mockNativeModule.initialize).toHaveBeenCalledWith(
      'test',
      'https://example.com/matomo',
      1,
      false
    );
  });

  it('should not modify URL without trailing slash', async () => {
    const tracker = new MatomoTracker('test');
    await tracker.initialize('https://example.com/matomo.php', 1);

    expect(mockNativeModule.initialize).toHaveBeenCalledWith(
      'test',
      'https://example.com/matomo.php',
      1,
      false
    );
  });

  it('should handle URL with multiple trailing slashes', async () => {
    const tracker = new MatomoTracker('test');
    // Only removes one trailing slash (as per the implementation)
    await tracker.initialize('https://example.com//', 1);

    expect(mockNativeModule.initialize).toHaveBeenCalledWith(
      'test',
      'https://example.com/',
      1,
      false
    );
  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should propagate native module errors', async () => {
    const error = new Error('Native error');
    mockNativeModule.trackEvent.mockRejectedValueOnce(error);

    const tracker = new MatomoTracker('test');
    await expect(tracker.trackEvent('Category', 'Action')).rejects.toThrow(
      'Native error'
    );
  });

  it('should handle initialization failure', async () => {
    const error = new Error('Failed to initialize');
    mockNativeModule.initialize.mockRejectedValueOnce(error);

    const tracker = new MatomoTracker('test');
    await expect(
      tracker.initialize('https://example.com', 1)
    ).rejects.toThrow('Failed to initialize');
  });
});
