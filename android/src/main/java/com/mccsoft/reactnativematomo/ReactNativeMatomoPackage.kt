package com.mccsoft.reactnativematomo

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ReactNativeMatomoPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == ReactNativeMatomoModule.NAME) {
            ReactNativeMatomoModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            ReactNativeMatomoModule.NAME to ReactModuleInfo(
                ReactNativeMatomoModule.NAME,
                ReactNativeMatomoModule.NAME,
                false, // canOverrideExistingModule
                false, // needsEagerInit
                false, // isCXXModule
                true   // isTurboModule
            )
        )
    }
}
