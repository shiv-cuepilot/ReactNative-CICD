#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"SnapBiodata";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  // Use the Expo Updates OTA bundle when the updates controller is available.
  // Resolved at runtime via NSClassFromString so no bridging header is required;
  // falls back to the embedded bundle when OTA is not wired.
  Class controllerClass = NSClassFromString(@"EXUpdatesAppController");
  if (controllerClass && [controllerClass respondsToSelector:@selector(sharedInstance)]) {
    id controller = [controllerClass performSelector:@selector(sharedInstance)];
    if (controller && [controller respondsToSelector:@selector(launchAssetUrl)]) {
      NSURL *url = [controller performSelector:@selector(launchAssetUrl)];
      if (url) {
        return url;
      }
    }
  }
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
