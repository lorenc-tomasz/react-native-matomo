import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  initialize(
    instanceId: string,
    apiUrl: string,
    siteId: number,
    cachedQueue: boolean
  ): Promise<void>;

  isInitialized(instanceId: string): Promise<boolean>;

  trackView(
    instanceId: string,
    route: string,
    title: string | null
  ): Promise<void>;

  trackEvent(
    instanceId: string,
    category: string,
    action: string,
    name: string | null,
    value: number,
    url: string | null
  ): Promise<void>;

  trackGoal(
    instanceId: string,
    goalId: number,
    revenue: number
  ): Promise<void>;

  trackAppDownload(instanceId: string): Promise<void>;

  setCustomDimension(
    instanceId: string,
    dimensionId: number,
    value: string | null
  ): Promise<void>;

  setUserId(instanceId: string, userId: string | null): Promise<void>;

  setAppOptOut(instanceId: string, isOptedOut: boolean): Promise<void>;

  isOptOut(instanceId: string): Promise<boolean>;

  dispatch(instanceId: string): Promise<void>;

  setDispatchInterval(instanceId: string, seconds: number): Promise<void>;

  getDispatchInterval(instanceId: string): Promise<number>;

  trackSiteSearch(
    instanceId: string,
    query: string,
    category: string | null,
    resultCount: number
  ): Promise<void>;

  stop(instanceId: string, dispatchRemaining: boolean): Promise<void>;

  reset(instanceId: string): Promise<void>;

  resetCustomDimensions(instanceId: string): Promise<void>;

  getUserId(instanceId: string): Promise<string | null>;

  startNewSession(instanceId: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ReactNativeMatomo');
