# Alert 시스템 리팩토링 완료

## 📋 개요
기존 Alert 컴포넌트를 React Native Alert API 스타일로 리팩토링하고, 2단계 권한 요청 시스템을 추가했습니다.

---

## ✅ 완료된 작업

### 1. 새로운 Alert 시스템 구축
- **위치**: `src/components/theme/Alert.tsx`
- **특징**:
  - React Native Alert.show() API와 동일한 사용법
  - 전역 어디서든 호출 가능
  - Animation 지원 (scale + fade)
  - 최대 3개 버튼 지원
  - Cancelable 옵션 지원

### 2. 권한 요청 시스템
- **상수**: `src/constants/permissions.ts` - 권한 메시지 정의
- **유틸리티**: `src/utils/permissions.ts` - 권한 요청 로직
- **지원 권한**:
  - 카메라 (`camera`)
  - 사진/갤러리 (`photo`)
  - 알림 (`notification`)

### 3. WriteReview 화면 리팩토링 완료
기존 state 기반 Alert에서 새로운 Alert.show() 방식으로 변경

#### Before (기존 코드)
```tsx
// Container
const [isAlertOpen, setIsAlertOpen] = useState(false);

const handlePressBack = () => {
  if (isDirty) {
    setIsAlertOpen(true);
  } else {
    navigation.goBack();
  }
};

// View에 props 전달
<WriteReviewView
  isAlertOpen={isAlertOpen}
  onAlertClose={handleAlertClose}
  onAlertCancel={handleAlertCancel}
  onAlertConfirm={handleAlertConfirm}
  ...
/>

// View에서 Alert 렌더링
<Alert
  isOpen={isAlertOpen}
  onClose={onAlertClose}
  onCancel={onAlertCancel}
  onConfirm={onAlertConfirm}
  title="후기 작성을 그만둘까요?"
  description="작성중이던 내용은 저장되지 않아요."
  cancelText="그만두기"
  confirmText="계속 작성"
/>
```

#### After (새로운 코드)
```tsx
// Container - state 제거, Alert.show() 사용
import {Alert} from '@/components/theme/Alert';

const handlePressBack = () => {
  if (isDirty) {
    Alert.show({
      title: '후기 작성을 그만둘까요?',
      message: '작성중이던 내용은 저장되지 않아요.',
      buttons: [
        {
          text: '그만두기',
          type: 'cancel',
          onPress: () => navigation.goBack(),
        },
        {
          text: '계속 작성',
          onPress: () => {},
        },
      ],
    });
  } else {
    navigation.goBack();
  }
};

// View - Alert 관련 props 모두 제거
// Alert 컴포넌트도 제거
```

#### 권한 요청 추가
```tsx
// 갤러리 열기 전 권한 요청
import {requestPermission} from '@/utils/permissions';

const handleImageSelect = () => {
  requestPermission(
    'photo',
    async () => {
      // 권한 허용 - 갤러리 열기
      const result = await launchImageLibrary({...});
    },
    () => {
      // 권한 거부 - 안내 메시지
      Alert.show({
        title: '사진 접근 권한 필요',
        message: '후기에 사진을 추가하려면 갤러리 접근 권한이 필요합니다.',
      });
    },
  );
};
```

---

## 🎯 주요 개선 사항

### 1. **코드 간결성**
- ❌ Before: Alert state 관리 + 3개 핸들러 함수 + View props 전달
- ✅ After: 단일 `Alert.show()` 호출

### 2. **관심사 분리**
- ✅ View: UI 렌더링만 담당
- ✅ Container: 비즈니스 로직 + Alert 호출

### 3. **재사용성**
- ✅ 전역 어디서든 동일한 방식으로 Alert 호출 가능
- ✅ 권한 요청도 단일 함수로 통합

### 4. **성능**
- ✅ 불필요한 state 제거
- ✅ View re-render 최소화

---

## 📚 사용 방법

### 기본 Alert
```tsx
import {Alert} from '@/components/theme/Alert';

// 1. 단순 알림
Alert.show({
  title: '성공',
  message: '작업이 완료되었습니다.',
});

// 2. 확인/취소
Alert.show({
  title: '삭제 확인',
  message: '정말로 삭제하시겠습니까?',
  buttons: [
    {text: '취소', type: 'cancel', onPress: () => {}},
    {text: '삭제', type: 'destructive', onPress: () => deleteItem()},
  ],
});
```

### 권한 요청
```tsx
import {requestPermission} from '@/utils/permissions';

// 카메라 권한
requestPermission(
  'camera',
  () => openCamera(),
  () => console.log('권한 거부')
);

// 사진 권한
requestPermission(
  'photo',
  () => openGallery(),
  () => showPermissionDeniedMessage()
);

// 알림 권한
requestPermission(
  'notification',
  () => enableNotifications(),
  () => {}
);
```

---

## 📁 파일 구조

```
src/
├── components/
│   ├── Alert.tsx                    # 레거시 호환성 (deprecated)
│   └── theme/
│       ├── Alert.tsx                # 새로운 Alert 컴포넌트
│       ├── AlertProvider.tsx        # Alert Provider
│       ├── Alert.example.tsx        # 사용 예제
│       ├── README_ALERT.md          # 상세 문서
│       └── index.ts                 # 통합 export
├── constants/
│   └── permissions.ts               # 권한 메시지 상수
├── utils/
│   └── permissions.ts               # 권한 요청 유틸리티
└── screens/
    └── user/
        └── WriteReview/
            ├── WriteReviewContainer.tsx  # ✅ 리팩토링 완료
            └── WriteReviewView.tsx       # ✅ 리팩토링 완료
```

---

## 🔧 필수 설정

### 1. App.tsx에 Provider 추가
```tsx
import {AlertProvider} from '@/components/theme/AlertProvider';

function App() {
  return (
    <AlertProvider>
      <YourApp />
    </AlertProvider>
  );
}
```

### 2. 패키지 설치 (권한 요청 사용 시)
```bash
npm install react-native-permissions
cd ios && pod install
```

### 3. Info.plist 권한 설명 추가 (iOS)
```xml
<key>NSCameraUsageDescription</key>
<string>프로필 사진 촬영을 위해 카메라 접근이 필요합니다.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>사진 업로드를 위해 갤러리 접근이 필요합니다.</string>
```

---

## 🎓 학습 자료

- **상세 가이드**: `src/components/theme/README_ALERT.md`
- **실전 예제**: `src/components/theme/Alert.example.tsx`
- **테스트 완료**: WriteReview 화면에서 동작 확인 가능

---

## 🚀 다음 단계

1. ✅ WriteReview 화면 리팩토링 완료
2. ⏳ 다른 화면들도 순차적으로 마이그레이션
3. ⏳ 레거시 Alert.tsx 제거 (모든 화면 마이그레이션 후)

---

## 💡 팁

### Alert 버튼 타입
- `default`: 일반 버튼 (파란색)
- `cancel`: 취소 버튼 (회색)
- `destructive`: 위험한 작업 버튼 (빨간색)

### 권한 메시지 커스터마이징
`src/constants/permissions.ts` 파일에서 메시지 수정 가능

### Import 방법
```tsx
// 추천: theme에서 통합 import
import {Alert, requestPermission} from '@/components/theme';

// 또는 개별 import
import {Alert} from '@/components/theme/Alert';
import {requestPermission} from '@/utils/permissions';
```
