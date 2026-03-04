import UIKit
import Expo
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import KakaoSDKAuth
import Firebase
import UserNotifications
import CodePush
import NaverThirdPartyLogin

@main
class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Firebase must be configured before React Native initialization
    FirebaseApp.configure()

    // Set notification delegate
    UNUserNotificationCenter.current().delegate = self

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "snaplink",
      in: window,
      launchOptions: launchOptions
    )

    RNSplashScreen.show()

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // APNs 토큰 등록 성공
  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
    let token = tokenParts.joined()
    print("APNs token registered: \(token)")
  }

  // APNs 토큰 등록 실패
  override func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("Failed to register for remote notifications: \(error)")
  }

  // Foreground에서 알림 수신 시 (알림을 표시할지 결정)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    // iOS 14+ 에서 배너, 사운드, 배지 모두 표시
    completionHandler([.banner, .sound, .badge])
  }

  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // naver
    if url.scheme == "snaplinkSV1KQ3L7CK" {
      return NaverThirdPartyLoginConnection.getSharedInstance().application(app, open: url, options: options)
    }

    // kakao
    if AuthApi.isKakaoTalkLoginUrl(url) {
      return AuthController.handleOpenUrl(url: url)
    }

    return false
  }

  // 알림 탭 시
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    print("User tapped notification: \(response.notification.request.content.userInfo)")
    completionHandler()
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
      if let url = URLContexts.first?.url {
          if (AuthApi.isKakaoTalkLoginUrl(url)) {
              _ = AuthController.handleOpenUrl(url: url)
          }
      }
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    // Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    CodePush.bundleURL()
#endif
  }
}
