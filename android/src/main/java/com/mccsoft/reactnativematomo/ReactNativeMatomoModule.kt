package com.mccsoft.reactnativematomo

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import org.matomo.sdk.Matomo
import org.matomo.sdk.TrackMe
import org.matomo.sdk.Tracker
import org.matomo.sdk.TrackerBuilder
import org.matomo.sdk.extra.CustomDimension
import org.matomo.sdk.extra.TrackHelper
import java.util.concurrent.TimeUnit

@ReactModule(name = ReactNativeMatomoModule.NAME)
class ReactNativeMatomoModule(reactContext: ReactApplicationContext) :
    NativeReactNativeMatomoSpec(reactContext) {

    companion object {
        const val NAME = "ReactNativeMatomo"
        private const val DEFAULT_INSTANCE_ID = "default"
        private val trackers = mutableMapOf<String, Tracker>()
        private val customDimensionsMap = mutableMapOf<String, MutableMap<Int, String>>()
    }

    override fun getName(): String = NAME

    override fun initialize(
        instanceId: String,
        apiUrl: String,
        siteId: Double,
        cachedQueue: Boolean,
        promise: Promise
    ) {
        try {
            val existingTracker = trackers[instanceId]
            if (existingTracker == null) {
                val builder = if (DEFAULT_INSTANCE_ID == instanceId) {
                    TrackerBuilder.createDefault(apiUrl, siteId.toInt())
                } else {
                    TrackerBuilder(apiUrl, siteId.toInt(), instanceId)
                }

                val newTracker = builder.build(Matomo.getInstance(reactApplicationContext))
                val callback = Tracker.Callback { trackMe -> onTrackCallback(instanceId, trackMe) }
                newTracker.addTrackingCallback(callback)

                trackers[instanceId] = newTracker
                customDimensionsMap[instanceId] = mutableMapOf()
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun isInitialized(instanceId: String, promise: Promise) {
        try {
            promise.resolve(trackers[instanceId] != null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun trackView(instanceId: String, route: String, title: String?, promise: Promise) {
        try {
            val actualTitle = title ?: route
            getTrackHelper(instanceId).screen(route).title(actualTitle).with(getTracker(instanceId))
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun trackEvent(
        instanceId: String,
        category: String,
        action: String,
        name: String?,
        value: Double,
        url: String?,
        promise: Promise
    ) {
        try {
            val event = getTrackHelper(instanceId).event(category, action)
            if (name != null) {
                event.name(name)
            }
            if (value >= 0) {
                event.value(value.toFloat())
            }
            if (url != null) {
                event.path(url)
            }
            event.with(getTracker(instanceId))
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun trackGoal(instanceId: String, goalId: Double, revenue: Double, promise: Promise) {
        try {
            val rev = if (revenue >= 0) revenue.toFloat() else null
            getTrackHelper(instanceId).goal(goalId.toInt()).revenue(rev).with(getTracker(instanceId))
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun trackAppDownload(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                getTrackHelper(instanceId).download().with(tracker)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun setAppOptOut(instanceId: String, isOptedOut: Boolean, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                tracker.isOptOut = isOptedOut
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun isOptOut(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                promise.resolve(tracker.isOptOut)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun setUserId(instanceId: String, userId: String?, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                tracker.userId = userId
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun setCustomDimension(
        instanceId: String,
        dimensionId: Double,
        value: String?,
        promise: Promise
    ) {
        try {
            val dimensions = customDimensionsMap[instanceId]
            if (dimensions == null) {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
                return
            }

            val dimId = dimensionId.toInt()
            if (value != null && value.isNotEmpty()) {
                dimensions[dimId] = value
            } else {
                dimensions.remove(dimId)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun dispatch(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                tracker.dispatch()
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun setDispatchInterval(instanceId: String, seconds: Double, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                tracker.dispatchInterval = TimeUnit.SECONDS.toMillis(seconds.toLong())
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun getDispatchInterval(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                val intervalMillis = tracker.dispatchInterval
                val intervalSeconds = TimeUnit.MILLISECONDS.toSeconds(intervalMillis).toInt()
                promise.resolve(intervalSeconds)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun trackSiteSearch(
        instanceId: String,
        query: String,
        category: String?,
        resultCount: Double,
        promise: Promise
    ) {
        try {
            val count = if (resultCount >= 0) resultCount.toInt() else null
            getTrackHelper(instanceId)
                .search(query)
                .category(category)
                .count(count)
                .with(getTracker(instanceId))
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun stop(instanceId: String, dispatchRemaining: Boolean, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                if (dispatchRemaining) {
                    tracker.dispatch()
                }
                tracker.isOptOut = true
                tracker.dispatchInterval = 0
                trackers.remove(instanceId)
                customDimensionsMap.remove(instanceId)
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun reset(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                tracker.reset()
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun resetCustomDimensions(instanceId: String, promise: Promise) {
        try {
            val dimensions = customDimensionsMap[instanceId]
            if (dimensions != null) {
                dimensions.clear()
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun getUserId(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                promise.resolve(tracker.userId)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun startNewSession(instanceId: String, promise: Promise) {
        try {
            val tracker = trackers[instanceId]
            if (tracker != null) {
                tracker.startNewSession()
                promise.resolve(null)
            } else {
                promise.reject("not_initialized", "Matomo instance '$instanceId' not initialized")
            }
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    private fun getTracker(instanceId: String): Tracker {
        return trackers[instanceId]
            ?: throw RuntimeException("Matomo instance '$instanceId' must be initialized before usage")
    }

    private fun getTrackHelper(instanceId: String): TrackHelper {
        val tracker = getTracker(instanceId)
        val dimensions = customDimensionsMap[instanceId]
        var trackHelper = TrackHelper.track()
        if (dimensions != null) {
            for ((key, value) in dimensions) {
                trackHelper = trackHelper.dimension(key, value)
            }
        }
        return trackHelper
    }

    private fun onTrackCallback(instanceId: String, trackMe: TrackMe): TrackMe {
        val dimensions = customDimensionsMap[instanceId]
        if (dimensions != null) {
            for ((key, value) in dimensions) {
                val dimension = CustomDimension(key, value)
                CustomDimension.setDimension(trackMe, dimension)
            }
        }
        return trackMe
    }
}
