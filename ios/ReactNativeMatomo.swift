import MatomoTracker
import Darwin

@objc(ReactNativeMatomo)
class ReactNativeMatomo: NSObject {

    var tracker: MatomoTracker!

    @objc(initialize:withId:witchCachedQueue:withResolver:withRejecter:)
    func initialize(
        url:String,
        id:NSNumber,
        cachedQueue: Bool,
        resolve:RCTPromiseResolveBlock,
        reject:RCTPromiseRejectBlock) -> Void
    {
        let baseUrl = URL(string:url)
        let siteId = id.stringValue
        
        if (cachedQueue) {
            let queue = UserDefaultsCachedQueue(UserDefaults.standard, siteId: siteId, autoSave: true)
            let dispatcher = URLSessionDispatcher(baseURL: baseUrl!)
            tracker = MatomoTracker(siteId: siteId, queue: queue, dispatcher: dispatcher)
        } else {
            tracker = MatomoTracker(siteId: siteId, baseURL: baseUrl!)
        }
        
        resolve(nil)
    }

    @objc(setUserId:withResolver:withRejecter:)
    func setUserId(userID:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            tracker.userId = userID
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }

    @objc(setCustomDimension:withValue:withResolver:withRejecter:)
    func setCustomDimension(index:NSNumber, value:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            if(value == nil){
                tracker.remove(dimensionAtIndex: index.intValue)
            } else {
                tracker.setDimension(value,forIndex:index.intValue)
            }
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }

    @objc(trackView:withTitle:withResolver:withRejecter:)
    func trackView(path: String, title: String?, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        guard let tracker = tracker else {
            reject("not_initialized", "Matomo not initialized. TrackView failed", nil)
            return
        }

        let actionName = (title ?? path).components(separatedBy: "/")
        let bundleIdentifier = Application.makeCurrentApplication().bundleIdentifier ?? "unknown"
        let urlString = "http://\(bundleIdentifier)\(path)"
        
        guard let url = URL(string: urlString) else {
            reject("invalid_url", "The generated URL is invalid.", nil)
            return
        }
        
        tracker.track(view: actionName, url: url)
        resolve(nil)
    }

    @objc(trackGoal:withValues:withResolver:withRejecter:)
    func trackGoal(goal:NSNumber, values:NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            let revenue = values.object(forKey: "revenue") as? Float
            tracker.trackGoal(id: goal.intValue, revenue: revenue)
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }

    @objc(trackEvent:withAction:withValues:withResolver:withRejecter:)
    func trackEvent(category:String, action:String, values:NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            let name = values.object(forKey: "name") as? String
            let value = values.object(forKey: "value") as? NSNumber
            let url = values.object(forKey: "url") as? String
            let nsUrl = url != nil ? URL.init(string: url!) : nil
            tracker.track(eventWithCategory: category, action: action, name: name, number: value, url: nsUrl)
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }

    @objc(trackAppDownload:withRejecter:)
    func trackAppDownload(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        // TODO: not implemented yet
        resolve(nil)
    }
    
    @objc(isInitialized:withRejecter:)
    func isInitialized(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        resolve(tracker != nil)
    }

    @objc(setAppOptOut:withResolver:withRejecter:)
    func setAppOptOut(optOut:Bool, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        tracker.isOptedOut = optOut;
        resolve(nil)
    }

    @objc(dispatch:withRejecter:)
    func dispatch(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            tracker.dispatch()
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }

    @objc(setDispatchInterval:withResolver:withRejecter:)
    func setDispatchInterval(seconds: NSNumber, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            tracker.dispatchInterval = seconds.doubleValue
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }

    @objc(getDispatchInterval:withRejecter:)
    func getDispatchInterval(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            resolve(tracker.dispatchInterval)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }
    
    @objc(trackSiteSearch:withCategory:withResultCount:withResolver:withRejecter:)
    func trackSiteSearch(query: String, category: String?, resultCount: NSNumber, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if (tracker != nil) {
            tracker.trackSearch(query: query, category: category, resultCount: resultCount.intValue)
            resolve(nil)
        } else {
            reject("not_initialized", "Matomo not initialized", nil)
        }
    }
}
