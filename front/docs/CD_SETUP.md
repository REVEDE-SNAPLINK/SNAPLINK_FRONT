# CI/CD 설정 가이드

Fastlane과 GitHub Actions를 사용한 iOS TestFlight 및 Android Internal Testing 자동 배포 가이드입니다.

## 목차
1. [사전 준비사항](#사전-준비사항)
2. [iOS 설정](#ios-설정)
3. [Android 설정](#android-설정)
4. [GitHub Secrets 설정](#github-secrets-설정)
5. [배포 실행](#배포-실행)
6. [트러블슈팅](#트러블슈팅)

---

## 사전 준비사항

### 필수 계정
- **iOS**: Apple Developer Account ($99/year)
- **Android**: Google Play Console 계정 (무료)
- **GitHub**: Repository에 대한 Admin 권한

### 로컬 환경 설정
```bash
# Ruby 설치 확인
ruby --version  # 2.6.10 이상

# Bundler로 Fastlane 설치
cd front
bundle install

# Fastlane 설치 확인
bundle exec fastlane --version
```

---

## iOS 설정

### 1. Apple Developer Portal 설정

#### App ID 생성
1. [Apple Developer Portal](https://developer.apple.com/account)에 로그인
2. **Certificates, Identifiers & Profiles** > **Identifiers** 이동
3. **+** 버튼 클릭하여 새 App ID 생성
   - Description: `SnapLink App`
   - Bundle ID: `com.snaplink.app` (원하는 ID로 변경 가능)
   - Capabilities: 필요한 기능 선택 (Push Notifications 등)

#### Distribution Certificate 생성
```bash
# Mac에서 Certificate Signing Request (CSR) 생성
# Keychain Access 앱 실행 > Certificate Assistant > Request a Certificate from a Certificate Authority
# 이메일과 이름 입력 후 "Saved to disk" 선택하여 CSR 파일 저장
```

1. Apple Developer Portal > **Certificates** > **+** 버튼
2. **Apple Distribution** 선택
3. 생성한 CSR 파일 업로드
4. 다운로드한 인증서(`.cer`)를 더블클릭하여 Keychain에 추가

#### Provisioning Profile 생성
1. Apple Developer Portal > **Profiles** > **+** 버튼
2. **App Store** 선택
3. App ID 선택
4. Distribution Certificate 선택
5. Profile 이름 입력 및 생성
6. 다운로드한 `.mobileprovision` 파일 저장

#### Certificate를 P12로 Export
```bash
# Keychain Access에서 인증서와 개인 키를 함께 선택
# 우클릭 > Export 2 items... > .p12 형식으로 저장
# 비밀번호 설정 (GitHub Secrets에 사용됨)
```

### 2. App Store Connect 설정

1. [App Store Connect](https://appstoreconnect.apple.com)에 로그인
2. **My Apps** > **+** > **New App** 클릭
3. 앱 정보 입력:
   - Platform: iOS
   - Name: SnapLink
   - Bundle ID: 위에서 생성한 Bundle ID 선택
   - SKU: 고유한 식별자 (예: `snaplink-001`)

#### App-Specific Password 생성
1. [appleid.apple.com](https://appleid.apple.com) 로그인
2. **Sign-In and Security** > **App-Specific Passwords**
3. **Generate Password** 클릭
4. 생성된 비밀번호 저장 (GitHub Secrets에 사용됨)

### 3. Xcode 프로젝트 설정

1. `front/ios/snaplinkapp.xcworkspace` 를 Xcode로 열기
2. Project Settings:
   - **General** 탭:
     - Display Name: `SnapLink`
     - Bundle Identifier: `com.snaplink.app`
     - Version: `1.0.0`
     - Build: `1`
   - **Signing & Capabilities** 탭:
     - Team 선택
     - Provisioning Profile 선택 (위에서 생성한 것)

---

## Android 설정

### 1. Google Play Console 설정

1. [Google Play Console](https://play.google.com/console) 로그인
2. **모든 앱** > **앱 만들기** 클릭
3. 앱 세부정보 입력:
   - 앱 이름: `SnapLink`
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 유료 또는 무료: 무료

### 2. Release Keystore 생성

```bash
cd front/android/app

# Keystore 생성
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias snaplink-release-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 정보 입력 (비밀번호는 안전한 곳에 저장!)
# - Keystore password (storePassword)
# - Key password (keyPassword)
# - 이름, 조직 등의 정보
```

**중요**: 생성한 `release.keystore` 파일과 비밀번호는 안전하게 보관하세요!

### 3. Android 프로젝트 설정

#### `front/android/app/build.gradle` 수정

```gradle
android {
    ...

    signingConfigs {
        release {
            if (project.hasProperty('SNAPLINK_RELEASE_STORE_FILE')) {
                storeFile file(SNAPLINK_RELEASE_STORE_FILE)
                storePassword SNAPLINK_RELEASE_STORE_PASSWORD
                keyAlias SNAPLINK_RELEASE_KEY_ALIAS
                keyPassword SNAPLINK_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 로컬 테스트용 `keystore.properties` 생성 (선택사항)

```bash
# front/android/keystore.properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=snaplink-release-key
storeFile=release.keystore
```

**주의**: `keystore.properties`는 절대 Git에 커밋하지 마세요! (`.gitignore`에 추가됨)

### 4. Google Play Service Account 생성

1. Google Play Console > **설정** > **API 액세스**
2. **새 서비스 계정 만들기** 클릭
3. Google Cloud Console로 이동
4. 서비스 계정 생성:
   - 이름: `github-actions-deployer`
   - 역할: **Service Account User**
5. JSON 키 생성:
   - 서비스 계정 클릭 > **키** 탭 > **키 추가** > **JSON**
   - 다운로드한 JSON 파일 저장

6. Google Play Console로 돌아가서:
   - 생성한 서비스 계정에 **Admin (모든 권한)** 또는 **Release manager** 권한 부여

---

## GitHub Secrets 설정

### iOS Secrets

GitHub Repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

| Secret 이름 | 설명 | 예시 |
|------------|------|-----|
| `APPLE_ID` | Apple ID 이메일 | `your-email@example.com` |
| `APPLE_TEAM_ID` | Apple Developer Team ID | `A1B2C3D4E5` |
| `APP_STORE_CONNECT_TEAM_ID` | App Store Connect Team ID | `123456789` |
| `IOS_APP_IDENTIFIER` | iOS Bundle ID | `com.snaplink.app` |
| `IOS_PROVISIONING_PROFILE_NAME` | Provisioning Profile 이름 | `SnapLink App Store Profile` |
| `IOS_CERTIFICATES_P12` | P12 인증서 (Base64 인코딩) | `cat certificate.p12 \| base64` |
| `IOS_CERTIFICATES_P12_PASSWORD` | P12 비밀번호 | `your-p12-password` |
| `IOS_PROVISIONING_PROFILE` | Provisioning Profile (Base64) | `cat profile.mobileprovision \| base64` |
| `FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD` | App-Specific Password | `xxxx-xxxx-xxxx-xxxx` |

#### Base64 인코딩 방법
```bash
# macOS/Linux
cat certificate.p12 | base64 | pbcopy  # 클립보드에 복사
cat profile.mobileprovision | base64 | pbcopy
```

### Android Secrets

| Secret 이름 | 설명 | 예시 |
|------------|------|-----|
| `ANDROID_PACKAGE_NAME` | Android Package Name | `com.snaplink.app` |
| `ANDROID_KEYSTORE_BASE64` | Keystore 파일 (Base64) | `cat release.keystore \| base64` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore 비밀번호 | `your-store-password` |
| `ANDROID_KEY_ALIAS` | Key Alias | `snaplink-release-key` |
| `ANDROID_KEY_PASSWORD` | Key 비밀번호 | `your-key-password` |
| `GOOGLE_PLAY_JSON_KEY` | Service Account JSON (Base64) | `cat service-account.json \| base64` |

#### Base64 인코딩 방법
```bash
# macOS/Linux
cat release.keystore | base64 | pbcopy  # 클립보드에 복사
cat service-account.json | base64 | pbcopy
```

### 선택적 Secrets

| Secret 이름 | 설명 |
|------------|------|
| `SLACK_WEBHOOK_URL` | Slack 알림용 Webhook URL (선택사항) |

---

## 배포 실행

### 자동 배포 (Git Push)

```bash
# develop 또는 main 브랜치에 푸시하면 자동 배포
git checkout develop
git add .
git commit -m "Release: v1.0.1"
git push origin develop
```

### 수동 배포 (GitHub Actions)

1. GitHub Repository > **Actions** 탭
2. 원하는 Workflow 선택:
   - **iOS Beta Deployment**
   - **Android Beta Deployment**
3. **Run workflow** 버튼 클릭
4. 브랜치 선택 및 실행

### 로컬에서 테스트 배포

```bash
cd front

# iOS TestFlight 배포
bundle exec fastlane ios beta

# Android Internal Testing 배포
bundle exec fastlane android beta
```

---

## 배포 확인

### iOS (TestFlight)
1. [App Store Connect](https://appstoreconnect.apple.com) 로그인
2. **TestFlight** 탭 이동
3. 업로드된 빌드 확인 (처리 시간: 10-30분)
4. 테스터 추가 및 배포

### Android (Internal Testing)
1. [Google Play Console](https://play.google.com/console) 로그인
2. **출시** > **테스트** > **내부 테스트** 이동
3. 업로드된 빌드 확인 (처리 시간: 즉시)
4. 테스터 추가 및 배포

---

## 트러블슈팅

### iOS

#### "No profiles for 'com.snaplink.app' were found"
- Provisioning Profile이 제대로 설치되지 않음
- `IOS_PROVISIONING_PROFILE` Secret이 올바른지 확인
- Profile이 만료되지 않았는지 확인

#### "Unauthorized - Please check that 'FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD' is correct"
- App-Specific Password가 잘못됨
- appleid.apple.com에서 새로 생성하여 교체

#### Build number already exists
```bash
# 수동으로 build number 증가
cd front/ios
agvtool next-version -all
```

### Android

#### "keystore tampered with or password incorrect"
- Keystore 비밀번호가 잘못됨
- Base64 인코딩이 제대로 되지 않음
```bash
# Base64 재인코딩
cat release.keystore | base64 | pbcopy
```

#### "Changes cannot be sent to the Play Store"
- Google Play Console에서 먼저 앱을 생성해야 함
- Service Account 권한이 부족함 (Release manager 권한 필요)

### GitHub Actions

#### Workflow가 실행되지 않음
- `front/**` 경로의 파일이 변경되었는지 확인
- Workflow 파일의 브랜치 이름이 올바른지 확인

#### Timeout
- `timeout-minutes` 값을 늘리기
- 네트워크 문제일 수 있으니 재실행

---

## 추가 리소스

- [Fastlane 공식 문서](https://docs.fastlane.tools)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Apple Developer 문서](https://developer.apple.com/documentation/)
- [Google Play Console 도움말](https://support.google.com/googleplay/android-developer)

---

## 문의

문제가 발생하면 GitHub Issues에 등록해주세요.
