import type { Spec } from '../NativeReactNativeMatomo';

// Mock the TurboModule — factory must be self-contained (jest.mock is hoisted)
jest.mock('../NativeReactNativeMatomo', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn().mockResolvedValue(undefined),
    isInitialized: jest.fn().mockResolvedValue(true),
    trackView: jest.fn().mockResolvedValue(undefined),
    trackEvent: jest.fn().mockResolvedValue(undefined),
    trackGoal: jest.fn().mockResolvedValue(undefined),
    trackAppDownload: jest.fn().mockResolvedValue(undefined),
    setCustomDimension: jest.fn().mockResolvedValue(undefined),
    setUserId: jest.fn().mockResolvedValue(undefined),
    setAppOptOut: jest.fn().mockResolvedValue(undefined),
    isOptOut: jest.fn().mockResolvedValue(false),
    dispatch: jest.fn().mockResolvedValue(undefined),
    setDispatchInterval: jest.fn().mockResolvedValue(undefined),
    getDispatchInterval: jest.fn().mockResolvedValue(120),
    trackSiteSearch: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
    resetCustomDimensions: jest.fn().mockResolvedValue(undefined),
    getUserId: jest.fn().mockResolvedValue('user-123'),
    startNewSession: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<Spec>,
}));

// Get reference to the mocked module
import NativeModule from '../NativeReactNativeMatomo';
const mockNativeModule = NativeModule as jest.Mocked<Spec>;

import {
  MatomoTracker,
  Matomo,
  initialize,
  isInitialized,
  trackView,
  trackEvent,
  trackGoal,
  trackAppDownload,
  setCustomDimension,
  setUserId,
  setAppOptOut,
  isOptOut,
  dispatch,
  setDispatchInterval,
  getDispatchInterval,
  trackSiteSearch,
  stop,
  reset,
  resetCustomDimensions,
  getUserId,
  startNewSession,
} from '../index';

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// MatomoTracker class
// =============================================================================

describe('MatomoTracker', () => {
  describe('constructor', () => {
    it('defaults instanceId to "default"', () => {
      const tracker = new MatomoTracker();
      expect(tracker.getInstanceId()).toBe('default');
    });

    it('accepts a custom instanceId', () => {
      const tracker = new MatomoTracker('analytics-2');
      expect(tracker.getInstanceId()).toBe('analytics-2');
    });
  });

  describe('normalizeUrl', () => {
    it('strips trailing slash from apiUrl', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initialize('https://matomo.example.com/', 1);
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://matomo.example.com',
        1,
        false
      );
    });

    it('leaves url without trailing slash unchanged', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initialize('https://matomo.example.com', 1);
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://matomo.example.com',
        1,
        false
      );
    });

    it('strips trailing slash from matomo.php url', async () => {
      const tracker = new MatomoTracker('test');
      await tracker.initialize('https://matomo.example.com/matomo.php/', 3);
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'test',
        'https://matomo.example.com/matomo.php',
        3,
        false
      );
    });
  });

  describe('initialize', () => {
    it('passes instanceId, normalized url, siteId, and cachedQueue', async () => {
      const tracker = new MatomoTracker('my-instance');
      await tracker.initialize('https://m.test.com', 42, true);
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'my-instance',
        'https://m.test.com',
        42,
        true
      );
    });

    it('defaults cachedQueue to false when omitted', async () => {
      const tracker = new MatomoTracker();
      await tracker.initialize('https://m.test.com', 1);
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'default',
        'https://m.test.com',
        1,
        false
      );
    });
  });

  describe('initializeWithOptions', () => {
    it('unpacks options object correctly', async () => {
      const tracker = new MatomoTracker('opts');
      await tracker.initializeWithOptions({
        apiUrl: 'https://matomo.io/',
        siteId: 7,
        cachedQueue: true,
      });
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'opts',
        'https://matomo.io',
        7,
        true
      );
    });

    it('defaults cachedQueue to false when not in options', async () => {
      const tracker = new MatomoTracker();
      await tracker.initializeWithOptions({
        apiUrl: 'https://matomo.io',
        siteId: 5,
      });
      expect(mockNativeModule.initialize).toHaveBeenCalledWith(
        'default',
        'https://matomo.io',
        5,
        false
      );
    });
  });

  describe('isInitialized', () => {
    it('passes instanceId and returns native result', async () => {
      mockNativeModule.isInitialized.mockResolvedValue(true);
      const tracker = new MatomoTracker('abc');
      const result = await tracker.isInitialized();
      expect(mockNativeModule.isInitialized).toHaveBeenCalledWith('abc');
      expect(result).toBe(true);
    });
  });

  describe('trackView', () => {
    it('passes route and title', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackView('/home', 'Home Screen');
      expect(mockNativeModule.trackView).toHaveBeenCalledWith(
        't',
        '/home',
        'Home Screen'
      );
    });

    it('defaults title to null when omitted', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackView('/settings');
      expect(mockNativeModule.trackView).toHaveBeenCalledWith(
        't',
        '/settings',
        null
      );
    });
  });

  describe('trackEvent', () => {
    it('passes all arguments', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackEvent('Video', 'Play', 'intro.mp4', 1, '/videos');
      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
        't',
        'Video',
        'Play',
        'intro.mp4',
        1,
        '/videos'
      );
    });

    it('defaults name to null, value to -1, url to null', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackEvent('Button', 'Click');
      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
        't',
        'Button',
        'Click',
        null,
        -1,
        null
      );
    });

    it('defaults only url to null when name and value are provided', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackEvent('Cat', 'Act', 'name', 99);
      expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
        't',
        'Cat',
        'Act',
        'name',
        99,
        null
      );
    });
  });

  describe('trackGoal', () => {
    it('passes goalId and revenue', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackGoal(1, 19.99);
      expect(mockNativeModule.trackGoal).toHaveBeenCalledWith('t', 1, 19.99);
    });

    it('defaults revenue to -1 when omitted', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackGoal(5);
      expect(mockNativeModule.trackGoal).toHaveBeenCalledWith('t', 5, -1);
    });
  });

  describe('trackAppDownload', () => {
    it('passes instanceId', async () => {
      const tracker = new MatomoTracker('dl');
      await tracker.trackAppDownload();
      expect(mockNativeModule.trackAppDownload).toHaveBeenCalledWith('dl');
    });
  });

  describe('setCustomDimension', () => {
    it('passes dimension id and value', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.setCustomDimension(1, 'premium');
      expect(mockNativeModule.setCustomDimension).toHaveBeenCalledWith(
        't',
        1,
        'premium'
      );
    });

    it('passes null value to clear dimension', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.setCustomDimension(1, null);
      expect(mockNativeModule.setCustomDimension).toHaveBeenCalledWith(
        't',
        1,
        null
      );
    });
  });

  describe('setUserId', () => {
    it('passes userId', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.setUserId('user-abc');
      expect(mockNativeModule.setUserId).toHaveBeenCalledWith('t', 'user-abc');
    });

    it('passes null to clear userId', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.setUserId(null);
      expect(mockNativeModule.setUserId).toHaveBeenCalledWith('t', null);
    });
  });

  describe('setAppOptOut', () => {
    it('passes opt-out status', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.setAppOptOut(true);
      expect(mockNativeModule.setAppOptOut).toHaveBeenCalledWith('t', true);
    });
  });

  describe('isOptOut', () => {
    it('returns native result', async () => {
      mockNativeModule.isOptOut.mockResolvedValue(true);
      const tracker = new MatomoTracker('t');
      const result = await tracker.isOptOut();
      expect(result).toBe(true);
      expect(mockNativeModule.isOptOut).toHaveBeenCalledWith('t');
    });
  });

  describe('dispatch', () => {
    it('passes instanceId', async () => {
      const tracker = new MatomoTracker('d');
      await tracker.dispatch();
      expect(mockNativeModule.dispatch).toHaveBeenCalledWith('d');
    });
  });

  describe('setDispatchInterval', () => {
    it('passes valid interval', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.setDispatchInterval(60);
      expect(mockNativeModule.setDispatchInterval).toHaveBeenCalledWith(
        't',
        60
      );
    });

    it('throws on zero interval', async () => {
      const tracker = new MatomoTracker('t');
      await expect(tracker.setDispatchInterval(0)).rejects.toThrow(
        'Invalid interval. The value must be a positive number.'
      );
      expect(mockNativeModule.setDispatchInterval).not.toHaveBeenCalled();
    });

    it('throws on negative interval', async () => {
      const tracker = new MatomoTracker('t');
      await expect(tracker.setDispatchInterval(-10)).rejects.toThrow(
        'Invalid interval. The value must be a positive number.'
      );
      expect(mockNativeModule.setDispatchInterval).not.toHaveBeenCalled();
    });

    it('throws on NaN', async () => {
      const tracker = new MatomoTracker('t');
      await expect(tracker.setDispatchInterval(NaN)).rejects.toThrow(
        'Invalid interval. The value must be a positive number.'
      );
      expect(mockNativeModule.setDispatchInterval).not.toHaveBeenCalled();
    });

    it('throws on non-number input', async () => {
      const tracker = new MatomoTracker('t');
      await expect(
        tracker.setDispatchInterval('60' as any)
      ).rejects.toThrow(
        'Invalid interval. The value must be a positive number.'
      );
      expect(mockNativeModule.setDispatchInterval).not.toHaveBeenCalled();
    });
  });

  describe('getDispatchInterval', () => {
    it('returns native result', async () => {
      mockNativeModule.getDispatchInterval.mockResolvedValue(300);
      const tracker = new MatomoTracker('t');
      const result = await tracker.getDispatchInterval();
      expect(result).toBe(300);
    });
  });

  describe('trackSiteSearch', () => {
    it('passes all arguments', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackSiteSearch('shoes', 'products', 42);
      expect(mockNativeModule.trackSiteSearch).toHaveBeenCalledWith(
        't',
        'shoes',
        'products',
        42
      );
    });

    it('defaults category to null, resultCount to -1', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.trackSiteSearch('boots');
      expect(mockNativeModule.trackSiteSearch).toHaveBeenCalledWith(
        't',
        'boots',
        null,
        -1
      );
    });
  });

  describe('stop', () => {
    it('passes dispatchRemaining true', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.stop({ dispatchRemaining: true });
      expect(mockNativeModule.stop).toHaveBeenCalledWith('t', true);
    });

    it('defaults dispatchRemaining to false', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.stop();
      expect(mockNativeModule.stop).toHaveBeenCalledWith('t', false);
    });

    it('defaults dispatchRemaining to false with empty options', async () => {
      const tracker = new MatomoTracker('t');
      await tracker.stop({});
      expect(mockNativeModule.stop).toHaveBeenCalledWith('t', false);
    });
  });

  describe('reset', () => {
    it('passes instanceId', async () => {
      const tracker = new MatomoTracker('r');
      await tracker.reset();
      expect(mockNativeModule.reset).toHaveBeenCalledWith('r');
    });
  });

  describe('resetCustomDimensions', () => {
    it('passes instanceId', async () => {
      const tracker = new MatomoTracker('r');
      await tracker.resetCustomDimensions();
      expect(mockNativeModule.resetCustomDimensions).toHaveBeenCalledWith('r');
    });
  });

  describe('getUserId', () => {
    it('returns native result', async () => {
      mockNativeModule.getUserId.mockResolvedValue('uid-456');
      const tracker = new MatomoTracker('t');
      const result = await tracker.getUserId();
      expect(result).toBe('uid-456');
    });

    it('returns null when no userId set', async () => {
      mockNativeModule.getUserId.mockResolvedValue(null);
      const tracker = new MatomoTracker('t');
      const result = await tracker.getUserId();
      expect(result).toBeNull();
    });
  });

  describe('startNewSession', () => {
    it('passes instanceId', async () => {
      const tracker = new MatomoTracker('s');
      await tracker.startNewSession();
      expect(mockNativeModule.startNewSession).toHaveBeenCalledWith('s');
    });
  });
});

// =============================================================================
// Exports
// =============================================================================

describe('exports', () => {
  it('Matomo is an alias for MatomoTracker', () => {
    expect(Matomo).toBe(MatomoTracker);
  });
});

// =============================================================================
// Legacy API — delegates to default MatomoTracker('default')
// =============================================================================

describe('Legacy API', () => {
  it('initialize delegates to native with instanceId "default"', async () => {
    await initialize('https://m.io/', 2, true);
    expect(mockNativeModule.initialize).toHaveBeenCalledWith(
      'default',
      'https://m.io',
      2,
      true
    );
  });

  it('isInitialized delegates with "default"', async () => {
    mockNativeModule.isInitialized.mockResolvedValue(false);
    const result = await isInitialized();
    expect(mockNativeModule.isInitialized).toHaveBeenCalledWith('default');
    expect(result).toBe(false);
  });

  it('trackView delegates with "default"', async () => {
    await trackView('/home', 'Home');
    expect(mockNativeModule.trackView).toHaveBeenCalledWith(
      'default',
      '/home',
      'Home'
    );
  });

  it('trackEvent delegates with "default"', async () => {
    await trackEvent('Cat', 'Act', 'Name', 10, '/url');
    expect(mockNativeModule.trackEvent).toHaveBeenCalledWith(
      'default',
      'Cat',
      'Act',
      'Name',
      10,
      '/url'
    );
  });

  it('trackGoal delegates with "default"', async () => {
    await trackGoal(3, 9.99);
    expect(mockNativeModule.trackGoal).toHaveBeenCalledWith(
      'default',
      3,
      9.99
    );
  });

  it('trackAppDownload delegates with "default"', async () => {
    await trackAppDownload();
    expect(mockNativeModule.trackAppDownload).toHaveBeenCalledWith('default');
  });

  it('setCustomDimension delegates with "default"', async () => {
    await setCustomDimension(2, 'val');
    expect(mockNativeModule.setCustomDimension).toHaveBeenCalledWith(
      'default',
      2,
      'val'
    );
  });

  it('setUserId delegates with "default"', async () => {
    await setUserId('u1');
    expect(mockNativeModule.setUserId).toHaveBeenCalledWith('default', 'u1');
  });

  it('setAppOptOut delegates with "default"', async () => {
    await setAppOptOut(true);
    expect(mockNativeModule.setAppOptOut).toHaveBeenCalledWith('default', true);
  });

  it('isOptOut delegates with "default"', async () => {
    mockNativeModule.isOptOut.mockResolvedValue(true);
    const result = await isOptOut();
    expect(mockNativeModule.isOptOut).toHaveBeenCalledWith('default');
    expect(result).toBe(true);
  });

  it('dispatch delegates with "default"', async () => {
    await dispatch();
    expect(mockNativeModule.dispatch).toHaveBeenCalledWith('default');
  });

  it('setDispatchInterval delegates with "default"', async () => {
    await setDispatchInterval(120);
    expect(mockNativeModule.setDispatchInterval).toHaveBeenCalledWith(
      'default',
      120
    );
  });

  it('getDispatchInterval delegates with "default"', async () => {
    mockNativeModule.getDispatchInterval.mockResolvedValue(60);
    const result = await getDispatchInterval();
    expect(result).toBe(60);
  });

  it('trackSiteSearch delegates with "default"', async () => {
    await trackSiteSearch('query', 'cat', 5);
    expect(mockNativeModule.trackSiteSearch).toHaveBeenCalledWith(
      'default',
      'query',
      'cat',
      5
    );
  });

  it('reset delegates with "default"', async () => {
    await reset();
    expect(mockNativeModule.reset).toHaveBeenCalledWith('default');
  });

  it('resetCustomDimensions delegates with "default"', async () => {
    await resetCustomDimensions();
    expect(mockNativeModule.resetCustomDimensions).toHaveBeenCalledWith(
      'default'
    );
  });

  it('stop delegates with "default"', async () => {
    await stop({ dispatchRemaining: true });
    expect(mockNativeModule.stop).toHaveBeenCalledWith('default', true);
  });

  it('getUserId delegates with "default"', async () => {
    mockNativeModule.getUserId.mockResolvedValue('legacy-user');
    const result = await getUserId();
    expect(result).toBe('legacy-user');
  });

  it('startNewSession delegates with "default"', async () => {
    await startNewSession();
    expect(mockNativeModule.startNewSession).toHaveBeenCalledWith('default');
  });
});

// =============================================================================
// Multiple instances
// =============================================================================

describe('Multiple tracker instances', () => {
  it('different instances use different instanceIds', async () => {
    const tracker1 = new MatomoTracker('site-a');
    const tracker2 = new MatomoTracker('site-b');

    await tracker1.trackView('/page1');
    await tracker2.trackView('/page2');

    expect(mockNativeModule.trackView).toHaveBeenCalledWith(
      'site-a',
      '/page1',
      null
    );
    expect(mockNativeModule.trackView).toHaveBeenCalledWith(
      'site-b',
      '/page2',
      null
    );
  });
});
