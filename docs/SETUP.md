# 개발 환경 설정 가이드

## 📋 사전 요구사항

- Node.js 18 이상
- React Native CLI 설치
- iOS 개발: Xcode, CocoaPods
- Android 개발: Android Studio, JDK

React Native 환경 설정이 처음이라면 [공식 가이드](https://reactnative.dev/docs/set-up-your-environment)를 먼저 참고하세요.

## 🚀 시작하기

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd SNAPLINK_FRONT/front
npm install
```

### 2. iOS 설정 (macOS만 해당)

```bash
# Ruby 번들러 설치 (처음만)
bundle install

# CocoaPods 의존성 설치
cd ios
bundle exec pod install
cd ..
```

### 3. 앱 실행

#### iOS (시뮬레이터)
```bash
npx react-native run-ios
```

#### Android (에뮬레이터)
```bash
npx react-native run-android
```

## 🔧 개발 환경

### Metro 서버 시작
```bash
npm start
```

### 캐시 초기화
```bash
npm start -- --reset-cache
```

### 주요 스크립트
- `npx react-native run-ios` - iOS 시뮬레이터에서 실행
- `npx react-native run-android` - Android 에뮬레이터에서 실행
- `npm run lint` - ESLint 실행
- `npm test` - Jest 테스트 실행

## 🐛 트러블슈팅

### iOS Pod 설치 실패
```bash
cd ios
pod deintegrate
bundle exec pod install
cd ..
```

### Android 빌드 실패
```bash
cd android
./gradlew clean
cd ..
```

### Metro bundler 캐시 문제
```bash
npx react-native start --reset-cache
```

## 📱 디바이스 테스트

### iOS 실제 기기
1. Xcode에서 프로젝트 열기
2. Signing & Capabilities에서 Team 설정
3. 기기 선택 후 빌드

### Android 실제 기기
1. USB 디버깅 활성화
2. `adb devices`로 연결 확인
3. `npm run android` 실행
