# CI/CD 파이프라인 가이드 (Github Actions + Fastlane + Revopush)

이 문서는 SnapLink 프로젝트의 CI/CD 파이프라인 설정 및 사용 방법에 대해 설명합니다.
Github Actions를 사용하여 Native 코드 변경 시 앱 스토어(테스트) 배포를, JS 코드 변경 시 Revopush를 통한 OTA 업데이트를 자동화합니다.

## 1. 아키텍처 개요

Github Actions 워크플로우는 `main` 또는 `develop` 브랜치에 코드가 푸시될 때 트리거됩니다.

1.  **변경 감지 (`check-changes`)**:
    - `front/android/**` 또는 `front/ios/**` 경로의 파일이 변경되었는지 확인합니다.
2.  **배포 분기 (`deploy`)**:
    - **Native 변경 감지 시**: 전체 빌드를 수행하고 Google Play Console(Internal) 또는 TestFlight로 업로드합니다. (`fastlane [platform] beta` 실행)
    - **JS 변경만 있을 시**: 번들만 빌드하여 Revopush로 배포합니다. (`fastlane [platform] codepush` 실행)

## 2. 필요 Secrets 설정

Github Repository > Settings > Secrets and variables > Actions에 다음 비밀 키들이 설정되어 있어야 합니다.

### 공통
- `REVOPUSH_ACCESS_KEY`: Revopush CLI 인증 키 (`revopush login` 명령어 후 확인 가능)
- `SLACK_WEBHOOK_URL`: 배포 알림용 슬랙 웹훅 (선택 사항)

### Android
- `ANDROID_KEYSTORE_BASE64`: Base64로 인코딩된 Release Keystore 파일 리
- `ANDROID_KEYSTORE_PASSWORD`: Keystore 비밀번호
- `ANDROID_KEY_ALIAS`: Key Alias
- `ANDROID_KEY_PASSWORD`: Key 비밀번호
- `GOOGLE_PLAY_JSON_KEY`: Google Play Console 서비스 계정 JSON 키
- `ANDROID_PACKAGE_NAME`: 패키지명 (예: `run.snaplink.client`)

### iOS
- `IOS_CERTIFICATES_P12`: Base64로 인코딩된 배포용 인증서(.p12)
- `IOS_CERTIFICATES_P12_PASSWORD`: 인증서 비밀번호
- `IOS_PROVISIONING_PROFILE`: Base64로 인코딩된 프로비저닝 프로파일(.mobileprovision)
- `APPLE_ID`: Apple ID 이메일
- `APPLE_TEAM_ID`: Team ID
- `APP_STORE_CONNECT_TEAM_ID`: App Store Connect Team ID
- `IOS_APP_IDENTIFIER`: Bundle ID (예: `run.snaplink.client`)
- `IOS_PROVISIONING_PROFILE_NAME`: 프로비저닝 프로파일 이름
- `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD`: 앱별 암호 (2FA 우회용)

## 3. Fastlane Lanes

### Android (`android/fastlane/Fastfile`)
- **`beta`**: Native 빌드 생성 → Google Play Console Internal Track 업로드
- **`codepush`**: JS 번들 생성 → Revopush 배포 (`deployment: Staging` 기본값)
- **`promote_to_production`**: Beta 트랙에서 Production 트랙으로 승격

### iOS (`ios/fastlane/Fastfile`)
- **`beta`**: Native 빌드 생성 → TestFlight 업로드
- **`codepush`**: JS 번들 생성 → Revopush 배포 (`deployment: Staging` 기본값)
- **`release`**: App Store 배포용 빌드 생성 및 업로드

## 4. 로컬 디버깅 및 수동 배포

로컬에서 수동으로 배포해야 할 경우 다음 명령어를 사용할 수 있습니다.

**Android CodePush 배포:**
```bash
cd front/android
bundle exec fastlane android codepush deployment:Production
```

**iOS CodePush 배포:**
```bash
cd front/ios
bundle exec fastlane ios codepush deployment:Production
```

## 5. 주의사항
- `Native` 모듈(npm install로 설치하는 라이브러리 중 native code 포함된 것)을 추가/업데이트 한 경우에는 반드시 **Native 빌드**가 필요합니다. 이 경우 `android/build.gradle`이나 `ios/Podfile` 등의 변화가 감지되어 자동으로 Native 배포가 수행되지만, 만약 감지되지 않는다면 임의로 native 파일을 수정하여 푸시해야 합니다.
- Revopush 배포 시 `code-push-cli` (또는 `@revopush/code-push-cli`)의 버전 호환성을 주기적으로 확인해주세요.
