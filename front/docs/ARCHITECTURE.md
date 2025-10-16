# 프로젝트 아키텍처

## 📁 폴더 구조

```
front/src/
├── components/          # 재사용 가능한 공통 컴포넌트
│   └── AppText.tsx     # 테마 기반 텍스트 컴포넌트
├── constants/          # 상수 정의
│   └── theme.ts        # 테마 시스템 (colors, typography, spacing, scale)
├── context/            # React Context API
│   ├── ThemeContext.tsx  # 테마 전역 상태
│   └── AuthContext.tsx   # 인증 전역 상태
├── navigation/         # 네비게이션 설정
│   ├── index.tsx           # NavigationContainer + Deep Linking 설정
│   ├── RootNavigator.tsx   # 루트 네비게이터 (인증 상태 기반 분기)
│   └── stacks/
│       ├── AuthStack.tsx      # 인증 관련 화면 스택
│       ├── MainStack.tsx      # 메인 앱 화면 스택
│       └── OnboardingStack.tsx # 온보딩 화면 스택
├── screens/           # 화면 컴포넌트
│   ├── SplashScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   └── auth/
│       ├── Login/
│       │   ├── LoginContainer.tsx    # 로직 레이어
│       │   └── LoginView.tsx         # UI 레이어
│       └── SelectType/
│           ├── SelectTypeContainer.tsx
│           └── SelectTypeView.tsx
└── types/            # TypeScript 타입 정의
    ├── auth.ts       # 인증 관련 타입
    └── svg.d.ts      # SVG 파일 타입 선언
```

## 🏗 아키텍처 패턴

### Container/Presentational Pattern

화면 컴포넌트는 로직과 UI를 분리합니다:

- **Container**: 비즈니스 로직, 상태 관리, API 호출
- **View (Presentational)**: UI 렌더링, props를 통해 데이터 수신

```tsx
// LoginContainer.tsx - 로직
export default function LoginContainer({ navigation }) {
  const { signIn } = useAuth();

  const handleKakaoLogin = async () => {
    // 로직 처리
  };

  return <LoginView onKakaoLogin={handleKakaoLogin} />;
}

// LoginView.tsx - UI
export default function LoginView({ onKakaoLogin }) {
  return (
    <Container>
      <Button onPress={onKakaoLogin}>카카오 로그인</Button>
    </Container>
  );
}
```

**적용 기준:**
- 복잡한 로직이 있는 화면: Container/View 분리
- 단순한 화면: 하나의 파일로 작성 가능

## 🎨 테마 시스템

### Theme 구조

```typescript
theme = {
  colors: { primary, secondary, background, text... },
  typography: { size, lineHeight, byWeightNumber, special },
  spacing: { xs, sm, md, lg, xl },
  radius: { sm, md, lg },
  scale: (size) => number,           // 가로 비율 조정
  verticalScale: (size) => number,   // 세로 비율 조정
  moderateScale: (size) => number,   // 중간 비율 조정
}
```

### 사용 방법

```tsx
import { theme } from '@/constants/theme';

const Button = styled.TouchableOpacity`
  width: ${theme.scale(335)}px;
  height: ${theme.verticalScale(55)}px;
  background-color: ${theme.colors.primary};
  border-radius: ${theme.radius.md}px;
`;
```

## 🧭 네비게이션

### 구조
```
RootNavigator
├─ SplashScreen (초기)
├─ OnboardingStack (온보딩 미완료 시)
├─ AuthStack (미인증)
│  ├─ Login
│  └─ SelectType
└─ MainStack (인증됨)
   └─ Home
```

### Deep Linking 설정

```typescript
// navigation/index.tsx
const linking = {
  prefixes: [
    'snaplink://',      // URI scheme
    'https://snap.lnk'  // Universal Links (OAuth 리다이렉션용)
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'auth/login',
          SelectType: 'auth/select',
        }
      }
    }
  }
}
```

**사용 예:**
- `snaplink://auth/login` → Login 화면
- `https://snap.lnk/auth/login?token=xxx` → OAuth 콜백

## 📦 상태 관리

### Context API 사용

#### AuthContext
```tsx
const { user, token, signIn, signOut } = useAuth();

// 로그인
await signIn(token, user, needsTypeSelection);

// 로그아웃
await signOut();
```

#### ThemeContext
```tsx
const { theme, isDarkMode, toggleTheme } = useTheme();
```

### AsyncStorage
- 인증 토큰: `@auth_token`
- 사용자 정보: `@user_data`
- 온보딩 완료: `@onboarding_seen`

## 🎯 반응형 디자인

### react-native-size-matters 사용

```tsx
// 기준 디바이스: iPhone X (375 x 812)
theme.scale(10)           // 가로 기반 스케일링
theme.verticalScale(10)   // 세로 기반 스케일링
theme.moderateScale(16)   // 폰트/아이콘 등 (과도한 스케일링 방지)
```

**사용 가이드:**
- 가로 크기 (width, padding-horizontal, margin-horizontal): `scale()`
- 세로 크기 (height, padding-vertical, margin-vertical): `verticalScale()`
- 폰트 크기, 아이콘: `moderateScale()`

## 🔌 향후 확장 예정

- API 레이어 (`src/api/`)
- 커스텀 훅 (`src/hooks/`)
- 유틸리티 함수 (`src/utils/`)
- 상수 관리 (`src/constants/`)
