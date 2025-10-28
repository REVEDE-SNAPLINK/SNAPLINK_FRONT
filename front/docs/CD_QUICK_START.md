# CD 빠른 시작 가이드

내부 테스팅을 위한 최소 설정 가이드입니다.

## 🚀 5분 안에 시작하기

### 1. Fastlane 설치 확인
```bash
cd front
bundle install
bundle exec fastlane --version
```

### 2. iOS 최소 설정

1. **Xcode에서 Archive 수동 테스트**
   ```bash
   cd front/ios
   pod install
   # Xcode로 snaplinkapp.xcworkspace 열기
   # Product > Archive 실행하여 정상 작동 확인
   ```

2. **App Store Connect에 첫 빌드 수동 업로드**
   - Xcode Archive 후 Organizer에서 "Distribute App" 클릭
   - TestFlight 선택
   - 업로드 완료

3. **이후 자동화는 GitHub Actions가 처리**

### 3. Android 최소 설정

1. **Release Keystore 생성**
   ```bash
   cd front/android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \
     -alias snaplink-key -keyalg RSA -keysize 2048 -validity 10000
   ```

   - **비밀번호는 안전하게 저장!**

2. **Google Play Console 설정**
   - [Play Console](https://play.google.com/console)에서 앱 생성
   - 내부 테스트 트랙 활성화
   - 첫 빌드는 수동 업로드 필요 (권한 설정용)

3. **Service Account 생성**
   - Play Console > 설정 > API 액세스
   - 서비스 계정 생성 및 JSON 키 다운로드
   - Release manager 권한 부여

### 4. GitHub Secrets 최소 설정

필수 Secrets만 추가하세요:

#### iOS (7개)
```bash
APPLE_ID=your-email@example.com
APPLE_TEAM_ID=ABC123DEF4
IOS_APP_IDENTIFIER=com.snaplink.app
FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Base64 인코딩 필요
IOS_CERTIFICATES_P12=$(cat certificate.p12 | base64)
IOS_CERTIFICATES_P12_PASSWORD=your-password
IOS_PROVISIONING_PROFILE=$(cat profile.mobileprovision | base64)
```

#### Android (5개)
```bash
ANDROID_PACKAGE_NAME=com.snaplink.app
ANDROID_KEY_ALIAS=snaplink-key
ANDROID_KEYSTORE_PASSWORD=your-store-password
ANDROID_KEY_PASSWORD=your-key-password

# Base64 인코딩 필요
ANDROID_KEYSTORE_BASE64=$(cat release.keystore | base64)
GOOGLE_PLAY_JSON_KEY=$(cat service-account.json | base64)
```

### 5. 배포 실행

```bash
git checkout develop
git add .
git commit -m "Setup CD"
git push origin develop
```

GitHub Actions에서 자동으로 빌드 및 배포가 시작됩니다!

---

## 📱 테스터 초대하기

### iOS TestFlight
1. App Store Connect > TestFlight
2. "Internal Testing" 또는 "External Testing" 선택
3. 이메일로 테스터 초대

### Android Internal Testing
1. Play Console > 테스트 > 내부 테스트
2. 테스터 이메일 리스트 추가
3. 테스터에게 링크 전송

---

## 🔧 로컬에서 테스트

```bash
cd front

# iOS
bundle exec fastlane ios beta

# Android
bundle exec fastlane android beta
```

---

## ❓ 문제 해결

### "빌드가 실패했어요"
1. GitHub Actions 탭에서 로그 확인
2. Secret 값이 올바른지 확인
3. Xcode/Android Studio에서 로컬 빌드 먼저 테스트

### "Base64 인코딩이 안돼요"
```bash
# macOS/Linux
cat your-file | base64 | pbcopy  # 자동으로 클립보드에 복사

# Windows (Git Bash)
cat your-file | base64
```

### "Provisioning Profile을 못 찾아요"
- Xcode에서 "Automatically manage signing" 비활성화
- Manual로 Provisioning Profile 선택
- Profile이 만료되지 않았는지 확인

---

더 자세한 내용은 [CD_SETUP.md](./CD_SETUP.md)를 참조하세요.
