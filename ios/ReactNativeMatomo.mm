#import "ReactNativeMatomo.h"

// Import the Swift-generated header
#if __has_include("mccsoft_react_native_matomo/mccsoft_react_native_matomo-Swift.h")
#import "mccsoft_react_native_matomo/mccsoft_react_native_matomo-Swift.h"
#elif __has_include("mccsoft-react-native-matomo/mccsoft-react-native-matomo-Swift.h")
#import "mccsoft-react-native-matomo/mccsoft-react-native-matomo-Swift.h"
#else
#import "mccsoft_react_native_matomo-Swift.h"
#endif

@implementation ReactNativeMatomo

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeReactNativeMatomoSpecJSI>(params);
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

@end
