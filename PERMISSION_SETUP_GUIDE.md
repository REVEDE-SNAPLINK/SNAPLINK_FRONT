# 권한 시스템 완벽 가이드

## 📱 Android Manifest 설정

### `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- 인터넷 (권한 요청 불필요) -->
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- 카메라 -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- 사진/미디어 접근 (Android 13+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <!-- 사진/미디어 접근 (Android 12 이하 호환성) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
                     android:maxSdkVersion="32" />

    <!-- 알림 (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- 파일 다운로드 시 필요 (Android 10 미만) -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                     android:maxSdkVersion="28" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <!-- ... -->
    </application>
</manifest>
```

### Android 버전별 권한 요약

| 권한 | Android 13+ | Android 10-12 | Android 9 이하 |
|------|------------|---------------|----------------|
| 사진 읽기 | READ_MEDIA_IMAGES | READ_EXTERNAL_STORAGE | READ_EXTERNAL_STORAGE |
| 파일 쓰기 | 불필요 (Scoped Storage) | 불필요 (Scoped Storage) | WRITE_EXTERNAL_STORAGE |
| 알림 | POST_NOTIFICATIONS | 불필요 | 불필요 |

---

## 🍎 iOS Info.plist 설정

### `ios/snaplink/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- 카메라 권한 -->
    <key>NSCameraUsageDescription</key>
    <string>프로필 사진을 촬영하고 리뷰에 사진을 추가하기 위해 카메라 접근 권한이 필요합니다.</string>

    <!-- 사진 라이브러리 권한 -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>프로필 사진과 리뷰 사진을 선택하기 위해 사진 라이브러리 접근 권한이 필요합니다.</string>

    <!-- iOS 14+ 사진 추가 권한 -->
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>촬영한 사진을 저장하기 위해 사진 라이브러리 추가 권한이 필요합니다.</string>

    <!-- 기타 앱 설정 -->
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <!-- ... -->
</dict>
</plist>
```

---

## 🎯 권한 요청 UX 모범 사례

### ✅ DO (권장)

1. **기능 실행 시점에 요청**
   ```tsx
   // ✅ 프로필 사진 변경 버튼 클릭 시
   const handleChangePhoto = () => {
     requestPermission('camera', openCamera);
   };
   ```

2. **명확한 이유 설명**
   ```tsx
   // ✅ 인앱 안내에서 권한이 필요한 이유 명시
   title: '카메라 접근 권한이 필요합니다'
   message: '프로필 사진 촬영을 위해 카메라에 접근합니다...'
   ```

3. **거부 시 대체 방법 제공**
   ```tsx
   // ✅ 카메라 거부 시에도 갤러리 선택 가능
   if (cameraPermissionDenied) {
     Alert.show({
       title: '갤러리에서 선택하시겠습니까?',
       buttons: [
         { text: '갤러리 열기', onPress: openGallery }
       ]
     });
   }
   ```

4. **설정 이동 안내 (BLOCKED 상태)**
   ```tsx
   // ✅ Android는 설정 앱 직접 열기
   if (Platform.OS === 'android') {
     openSettings();
   } else {
     // ✅ iOS는 설정 경로 안내
     Alert.show({
       message: '설정 > Snaplink > 카메라에서 권한을 허용해주세요.'
     });
   }
   ```

### ❌ DON'T (금지)

1. **앱 시작 시 일괄 요청**
   ```tsx
   // ❌ 앱 실행 직후 모든 권한 요청 (즉시 리젝)
   useEffect(() => {
     requestMultiplePermissions(['camera', 'photo', 'notification']);
   }, []);
   ```

2. **권한 없이 앱 사용 불가**
   ```tsx
   // ❌ 권한 거부 시 앱 종료 또는 차단
   if (!hasPermission) {
     Alert.show({
       title: '권한이 필요합니다',
       message: '권한을 허용하지 않으면 앱을 사용할 수 없습니다.',
       buttons: [{ text: '앱 종료', onPress: () => BackHandler.exitApp() }]
     });
   }
   ```

3. **반복적인 권한 요청 팝업**
   ```tsx
   // ❌ 거부할 때마다 계속 팝업 표시
   useEffect(() => {
     const interval = setInterval(() => {
       if (!hasPermission) {
         requestPermission('camera');
       }
     }, 5000);
   }, []);
   ```

4. **이유 없는 권한 요청**
   ```tsx
   // ❌ 설명 없이 바로 권한 요청
   const result = await request(PERMISSIONS.ANDROID.CAMERA);
   ```

---

## 📋 권한 상태별 플로우

### 첫 권한 요청 (unavailable/denied 상태)

```
사용자 → [기능 클릭]
  ↓
인앱 안내 Alert 표시
  ↓
[확인] 버튼 클릭
  ↓
시스템 권한 요청 다이얼로그
  ↓
┌─────────────┬─────────────┐
│ 허용        │ 거부        │
└─────────────┴─────────────┘
      ↓              ↓
  기능 실행      다음에 다시 요청 가능
```

### 두 번째 요청 (denied 상태)

```
사용자 → [기능 클릭]
  ↓
인앱 안내 생략 (이미 봤음)
  ↓
시스템 권한 요청 다이얼로그
  ↓
┌─────────────┬─────────────────────┐
│ 허용        │ 다시 묻지 않음 체크  │
└─────────────┴─────────────────────┘
      ↓                  ↓
  기능 실행          BLOCKED 상태로 전환
```

### BLOCKED 상태

```
사용자 → [기능 클릭]
  ↓
설정 안내 Alert 표시
  ↓
[설정 열기] 버튼 (Android)
[확인] 버튼 (iOS)
  ↓
Android: 앱 설정 페이지 열림
iOS: 사용자가 수동으로 설정 앱 이동
```

---

## 🔐 파일 다운로드/저장 권한

### Android 10 (API 29) 이상

**Scoped Storage** 사용 → **권한 불필요**

```tsx
// ✅ 권한 없이 앱 전용 디렉토리에 저장 가능
import RNFS from 'react-native-fs';

const downloadPath = `${RNFS.DownloadDirectoryPath}/myfile.zip`;
await RNFS.downloadFile({
  fromUrl: fileUrl,
  toFile: downloadPath,
}).promise;
```

### Android 9 (API 28) 이하

**WRITE_EXTERNAL_STORAGE** 필요

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                 android:maxSdkVersion="28" />
```

### iOS

**권한 불필요** (앱 샌드박스 내 저장)

---

## 🎮 Play Store 심사 체크리스트

### ✅ 필수 준수사항

- [ ] 권한 요청 시 명확한 이유 설명 (인앱 안내)
- [ ] 기능 실행 시점에만 권한 요청
- [ ] 권한 거부 시에도 앱의 핵심 기능 사용 가능
- [ ] 반복적인 권한 요청 팝업 없음
- [ ] BLOCKED 상태 시 설정 이동 안내
- [ ] 권한 강요 금지 (앱 종료/차단 금지)

### 📱 테스트 시나리오

1. **첫 요청 테스트**
   - 인앱 안내 → 시스템 요청 → 허용/거부

2. **거부 후 재요청**
   - 인앱 안내 생략 → 바로 시스템 요청

3. **BLOCKED 상태**
   - 설정 안내 표시 → 설정 이동

4. **앱 재시작 후**
   - 권한 상태 유지 확인
   - 인앱 안내는 다시 표시 (메모리 초기화)

---

## 🛠 현재 구현 요약

### 파일 구조

```
src/
├── utils/
│   └── permissions.ts          # 권한 로직
├── constants/
│   └── permissions.ts          # 권한 메시지
└── components/
    └── theme/
        ├── Alert.tsx           # Alert 컴포넌트
        └── AlertProvider.tsx   # Alert Provider
```

### 주요 함수

```typescript
// 권한 상태 확인
const status = await checkPermission('camera');

// 권한 요청
requestPermission(
  'camera',
  () => console.log('허용'),
  () => console.log('거부')
);

// 여러 권한 요청
requestMultiplePermissions(
  ['camera', 'photo'],
  () => console.log('모두 허용'),
  (denied) => console.log('거부된 권한:', denied)
);
```

### 지원 권한

- `camera`: 카메라
- `photo`: 사진 라이브러리
- `notification`: 알림 (requestNotifications 사용)

---

## 🚀 다음 단계

1. **Android/iOS 실기기 테스트**
   - 모든 권한 시나리오 테스트
   - BLOCKED 상태 테스트
   - 앱 재시작 후 동작 확인

2. **권한 메시지 개선**
   - Play Store 정책에 맞춰 문구 수정
   - 법적 검토 (필요 시)

3. **추가 권한 구현**
   - 위치 권한 (필요 시)
   - 연락처 권한 (필요 시)

---

## 📚 참고 자료

- [react-native-permissions 공식 문서](https://github.com/zoontek/react-native-permissions)
- [Android 권한 가이드](https://developer.android.com/training/permissions/requesting)
- [iOS 권한 가이드](https://developer.apple.com/documentation/uikit/protecting_the_user_s_privacy)
- [Play Store 권한 정책](https://support.google.com/googleplay/android-developer/answer/9888170)
