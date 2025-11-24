# Alert 사용 가이드

## 📋 목차
1. [설치 및 설정](#설치-및-설정)
2. [기본 Alert 사용법](#기본-alert-사용법)
3. [권한 요청 Alert 사용법](#권한-요청-alert-사용법)
4. [API 문서](#api-문서)

---

## 설치 및 설정

### 1. AlertProvider 추가
앱의 최상위 컴포넌트에 `AlertProvider`를 추가합니다.

```tsx
// App.tsx
import {AlertProvider} from '@/components/theme/AlertProvider';

function App() {
  return (
    <AlertProvider>
      {/* 나머지 앱 컴포넌트 */}
      <YourAppContent />
    </AlertProvider>
  );
}
```

### 2. 필요한 패키지 설치
권한 요청 기능을 사용하려면 다음 패키지가 필요합니다:

```bash
npm install react-native-permissions
```

iOS의 경우 추가 설정:
```bash
cd ios && pod install
```

---

## 기본 Alert 사용법

### React Native Alert처럼 사용하기

```tsx
import {Alert} from '@/components/theme/Alert';

// 1. 기본 Alert (확인 버튼만)
Alert.show({
  title: '성공',
  message: '작업이 완료되었습니다.',
});

// 2. 확인/취소 버튼
Alert.show({
  title: '삭제 확인',
  message: '정말로 삭제하시겠습니까?',
  buttons: [
    {
      text: '취소',
      onPress: () => console.log('취소됨'),
      type: 'cancel',
    },
    {
      text: '삭제',
      onPress: () => console.log('삭제됨'),
      type: 'destructive',
    },
  ],
});

// 3. 커스텀 버튼 여러개
Alert.show({
  title: '옵션 선택',
  message: '원하는 작업을 선택하세요',
  buttons: [
    {text: '옵션 1', onPress: () => console.log('옵션 1')},
    {text: '옵션 2', onPress: () => console.log('옵션 2')},
  ],
});

// 4. 바깥 영역 터치 불가능하게
Alert.show({
  title: '중요',
  message: '반드시 선택해야 합니다',
  buttons: [{text: '확인', onPress: () => {}}],
  cancelable: false, // 바깥 터치로 닫기 비활성화
});
```

---

## 권한 요청 Alert 사용법

### 2단계 권한 요청 (인앱 안내 → 시스템 요청)

```tsx
import {requestPermission} from '@/utils/permissions';

// 카메라 권한 요청
function openCamera() {
  requestPermission(
    'camera',
    // 권한 허용 시
    () => {
      console.log('카메라 권한 허용됨');
      // 카메라 열기 로직
    },
    // 권한 거부 시
    () => {
      console.log('카메라 권한 거부됨');
      // 대체 로직 또는 안내
    },
  );
}

// 사진 권한 요청
function selectPhoto() {
  requestPermission(
    'photo',
    () => {
      // 갤러리 열기
    },
    () => {
      // 권한 거부 처리
    },
  );
}

// 알림 권한 요청
function enableNotification() {
  requestPermission(
    'notification',
    () => {
      // 알림 설정 완료
    },
    () => {
      // 권한 거부 처리
    },
  );
}
```

### 여러 권한 한번에 요청

```tsx
import {requestMultiplePermissions} from '@/utils/permissions';

function setupProfile() {
  requestMultiplePermissions(
    ['camera', 'photo'],
    // 모든 권한 허용 시
    () => {
      console.log('모든 권한 허용됨');
      // 프로필 설정 화면으로 이동
    },
    // 일부 권한 거부 시
    deniedPermissions => {
      console.log('거부된 권한:', deniedPermissions);
      // 부분적으로 기능 제한
    },
  );
}
```

### 권한 상태만 확인

```tsx
import {checkPermission} from '@/utils/permissions';

async function checkCameraStatus() {
  const status = await checkPermission('camera');

  if (status === 'granted') {
    // 권한 있음
  } else if (status === 'blocked') {
    // 영구 거부됨 (설정으로 안내 필요)
  } else {
    // 권한 요청 필요
  }
}
```

---

## API 문서

### Alert.show(options)

**Parameters:**
- `options.title` (string, required): Alert 제목
- `options.message` (string, optional): Alert 메시지
- `options.buttons` (AlertButton[], optional): 버튼 배열 (기본값: [{text: '확인'}])
- `options.cancelable` (boolean, optional): 바깥 터치로 닫기 가능 여부 (기본값: true)

**AlertButton:**
```ts
{
  text: string;           // 버튼 텍스트
  onPress: () => void;    // 클릭 시 실행할 함수
  type?: 'default' | 'cancel' | 'destructive';  // 버튼 스타일
}
```

---

### requestPermission(type, onGranted, onDenied)

**Parameters:**
- `type`: 'camera' | 'photo' | 'notification'
- `onGranted`: () => void (권한 허용 시 콜백)
- `onDenied`: () => void (권한 거부 시 콜백)

**동작 흐름:**
1. 현재 권한 상태 확인
2. 이미 허용됨 → `onGranted()` 즉시 호출
3. 거부됨 → 인앱 안내 Alert 표시
4. 사용자가 "확인" 클릭 → 시스템 권한 요청 Alert 표시
5. 시스템에서 허용/거부 → 각각의 콜백 호출
6. 영구 거부된 경우 → 설정으로 이동 안내

---

### requestMultiplePermissions(types, onAllGranted, onSomeDenied)

**Parameters:**
- `types`: PermissionType[] (요청할 권한 배열)
- `onAllGranted`: () => void (모든 권한 허용 시)
- `onSomeDenied`: (deniedPermissions: PermissionType[]) => void (일부 거부 시)

---

### checkPermission(type)

**Parameters:**
- `type`: 'camera' | 'photo' | 'notification'

**Returns:**
- Promise<'granted' | 'denied' | 'blocked' | 'unavailable' | 'limited'>

---

## 실제 사용 예제

### 프로필 사진 변경

```tsx
import {Alert} from '@/components/theme/Alert';
import {requestPermission} from '@/utils/permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

function ProfilePhotoButton() {
  const handlePhotoChange = () => {
    Alert.show({
      title: '프로필 사진 변경',
      message: '사진을 선택하거나 촬영하세요',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {},
        },
        {
          text: '사진 촬영',
          onPress: () => {
            requestPermission(
              'camera',
              () => {
                launchCamera({mediaType: 'photo'}, response => {
                  // 사진 처리
                });
              },
              () => {
                Alert.show({
                  title: '카메라 권한 필요',
                  message: '프로필 사진 촬영을 위해 카메라 권한이 필요합니다.',
                });
              },
            );
          },
        },
        {
          text: '갤러리에서 선택',
          onPress: () => {
            requestPermission(
              'photo',
              () => {
                launchImageLibrary({mediaType: 'photo'}, response => {
                  // 사진 처리
                });
              },
            );
          },
        },
      ],
    });
  };

  return <Button onPress={handlePhotoChange}>프로필 사진 변경</Button>;
}
```

### 로그아웃 확인

```tsx
function LogoutButton() {
  const handleLogout = () => {
    Alert.show({
      title: '로그아웃',
      message: '정말 로그아웃 하시겠습니까?',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {},
        },
        {
          text: '로그아웃',
          type: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          },
        },
      ],
    });
  };

  return <Button onPress={handleLogout}>로그아웃</Button>;
}
```

---

## 권한 메시지 커스터마이징

권한 요청 메시지를 수정하려면 `src/constants/permissions.ts` 파일을 편집하세요.

```ts
export const PERMISSION_MESSAGES = {
  camera: {
    inApp: {
      title: '커스텀 제목',
      body: '커스텀 설명',
      confirmText: '확인',
    },
    system: {
      title: '시스템 권한 요청 제목',
      body: '시스템 권한 요청 설명',
      allowText: '허용',
      denyText: '거부',
    },
  },
  // ...
};
```
