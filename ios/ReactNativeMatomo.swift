import MatomoTracker
import Foundation

extension ReactNativeMatomo {

    /// Default instance ID for backward compatibility
    private static var DEFAULT_INSTANCE_ID: String { "default" }

    /// Dictionary to store multiple tracker instances
    private static var trackers: [String: MatomoTracker] {
        get { _trackers }
        set { _trackers = newValue }
    }

    /// Dictionary to store custom dimensions per instance
    private static var customDimensions: [String: [Int: String]] {
        get { _customDimensions }
        set { _customDimensions = newValue }
    }

    // Static stored properties need to be in a non-extension context
    // We use associated-object-like pattern via global variables
    private static var _trackers: [String: MatomoTracker] = [:]
    private static var _customDimensions: [String: [Int: String]] = [:]

    /// Generate a unique cache key for an instance
    private func cacheKey(for instanceId: String, siteId: String) -> String {
        if instanceId == ReactNativeMatomo.DEFAULT_INSTANCE_ID {
            return siteId
        }
        return "\(instanceId)_\(siteId)"
    }

    @objc func initialize(
        _ instanceId: String,
        apiUrl url: String,
        siteId siteIdNumber: Double,
        cachedQueue: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        let baseUrl = URL(string: url)
        let siteId = String(Int(siteIdNumber))
        let cacheIdentifier = cacheKey(for: instanceId, siteId: siteId)

        var newTracker: MatomoTracker

        if cachedQueue {
            let queue = UserDefaultsCachedQueue(UserDefaults.standard, siteId: cacheIdentifier, autoSave: true)
            let dispatcher = URLSessionDispatcher(baseURL: baseUrl!)
            newTracker = MatomoTracker(siteId: siteId, queue: queue, dispatcher: dispatcher)
        } else {
            newTracker = MatomoTracker(siteId: siteId, baseURL: baseUrl!)
        }

        ReactNativeMatomo.trackers[instanceId] = newTracker
        ReactNativeMatomo.customDimensions[instanceId] = [:]

        resolve(nil)
    }

    @objc func isInitialized(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(ReactNativeMatomo.trackers[instanceId] != nil)
    }

    @objc func setUserId(
        _ instanceId: String,
        userId userID: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        tracker.userId = userID
        resolve(nil)
    }

    @objc func setCustomDimension(
        _ instanceId: String,
        dimensionId: Double,
        value: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let _ = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }

        let index = Int(dimensionId)
        if let unwrappedValue = value, !unwrappedValue.isEmpty {
            ReactNativeMatomo.trackers[instanceId]?.setDimension(unwrappedValue, forIndex: index)
            if ReactNativeMatomo.customDimensions[instanceId] == nil {
                ReactNativeMatomo.customDimensions[instanceId] = [:]
            }
            ReactNativeMatomo.customDimensions[instanceId]?[index] = unwrappedValue
        } else {
            ReactNativeMatomo.trackers[instanceId]?.remove(dimensionAtIndex: index)
            ReactNativeMatomo.customDimensions[instanceId]?.removeValue(forKey: index)
        }

        resolve(nil)
    }

    @objc func trackView(
        _ instanceId: String,
        route path: String,
        title: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized. TrackView failed", nil)
            return
        }

        let action = (title ?? path).components(separatedBy: "/")
        let url = tracker.contentBase?.appendingPathComponent(path)

        guard let finalURL = url else {
            reject("invalid_url", "Failed to generate a valid URL.", nil)
            return
        }

        tracker.track(view: action, url: finalURL)
        resolve(nil)
    }

    @objc func trackGoal(
        _ instanceId: String,
        goalId: Double,
        revenue: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        let rev: Float? = revenue >= 0 ? Float(revenue) : nil
        tracker.trackGoal(id: Int(goalId), revenue: rev)
        resolve(nil)
    }

    @objc func trackEvent(
        _ instanceId: String,
        category: String,
        action: String,
        name: String?,
        value: Double,
        url: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        let numberValue: NSNumber? = value >= 0 ? NSNumber(value: value) : nil
        let nsUrl = url != nil ? URL(string: url!) : nil
        tracker.track(eventWithCategory: category, action: action, name: name, number: numberValue, url: nsUrl)
        resolve(nil)
    }

    @objc func trackAppDownload(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        // Not implemented on iOS
        resolve(nil)
    }

    @objc func setAppOptOut(
        _ instanceId: String,
        isOptedOut optOut: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        tracker.isOptedOut = optOut
        resolve(nil)
    }

    @objc func isOptOut(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        resolve(tracker.isOptedOut)
    }

    @objc func dispatch(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        tracker.dispatch()
        resolve(nil)
    }

    @objc func setDispatchInterval(
        _ instanceId: String,
        seconds: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        tracker.dispatchInterval = seconds
        resolve(nil)
    }

    @objc func getDispatchInterval(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        resolve(tracker.dispatchInterval)
    }

    @objc func trackSiteSearch(
        _ instanceId: String,
        query: String,
        category: String?,
        resultCount: Double,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        let count: Int? = resultCount >= 0 ? Int(resultCount) : nil
        tracker.trackSearch(query: query, category: category, resultCount: count)
        resolve(nil)
    }

    @objc func stop(
        _ instanceId: String,
        dispatchRemaining: Bool,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }

        if dispatchRemaining {
            tracker.dispatch()
        }

        tracker.isOptedOut = true
        tracker.dispatchInterval = 0

        ReactNativeMatomo.trackers.removeValue(forKey: instanceId)
        ReactNativeMatomo.customDimensions.removeValue(forKey: instanceId)

        resolve(nil)
    }

    @objc func reset(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        tracker.reset()
        resolve(nil)
    }

    @objc func resetCustomDimensions(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }

        if let dimensions = ReactNativeMatomo.customDimensions[instanceId] {
            for index in dimensions.keys {
                tracker.remove(dimensionAtIndex: index)
            }
        }
        ReactNativeMatomo.customDimensions[instanceId] = [:]

        resolve(nil)
    }

    @objc func getUserId(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        resolve(tracker.userId)
    }

    @objc func startNewSession(
        _ instanceId: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let tracker = ReactNativeMatomo.trackers[instanceId] else {
            reject("not_initialized", "Matomo instance '\(instanceId)' not initialized", nil)
            return
        }
        tracker.startNewSession()
        resolve(nil)
    }
}
