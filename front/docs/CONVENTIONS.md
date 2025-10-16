# 코딩 컨벤션

## 📝 파일 및 폴더 네이밍

### 파일명
- **컴포넌트**: PascalCase (예: `LoginView.tsx`, `AppText.tsx`)
- **유틸/훅**: camelCase (예: `useAuth.ts`, `formatDate.ts`)
- **타입 정의**: camelCase (예: `auth.ts`, `navigation.ts`)
- **상수**: camelCase (예: `theme.ts`, `colors.ts`)

### 폴더명
- **소문자**: `components`, `screens`, `navigation`
- **화면별 폴더**: PascalCase (예: `Login/`, `SelectType/`)

## 🎨 스타일링 규칙

### styled-components 사용

✅ **권장:**
```tsx
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md}px;
`;
```

❌ **지양:**
```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  }
});
```

### 컴포넌트 위치
- **styled-components**: 파일 하단에 정의
- **순서**: 기본 컴포넌트 → 조건부 컴포넌트 → 스타일 컴포넌트

```tsx
export default function MyScreen() {
  return <Container>...</Container>;
}

const Container = styled.View`...`;
const Title = styled.Text`...`;
```

## 📱 테마 사용

### theme import
```tsx
import { theme } from '@/constants/theme';
```

❌ **hook 사용 금지:**
```tsx
// 사용하지 마세요
const { theme } = useTheme();
```

### 색상 사용
```tsx
// styled-components 내부
background-color: ${theme.colors.primary};
color: ${theme.colors.textPrimary};

// inline style (불가피한 경우)
style={{ color: theme.colors.primary }}
```

### 스케일링
```tsx
// 가로 (width, horizontal padding/margin)
width: ${theme.scale(335)}px;
margin-horizontal: ${theme.scale(32)}px;

// 세로 (height, vertical padding/margin)
height: ${theme.verticalScale(55)}px;
padding-top: ${theme.verticalScale(20)}px;

// 폰트/아이콘
font-size: ${theme.moderateScale(16)}px;
```

## 📄 텍스트 컴포넌트

### AppText 사용 필수

✅ **권장:**
```tsx
<AppText size="lg" weight={700} color="primary">
  텍스트 내용
</AppText>
```

❌ **지양:**
```tsx
<Text style={{ fontSize: 16, fontWeight: '700', color: '#54C1A1' }}>
  텍스트 내용
</Text>
```

### AppText Props
```tsx
size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'  // 기본: 'md'
weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900  // 기본: 400
color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | ...
special?: 'kboBold'  // 특수 폰트
align?: 'left' | 'center' | 'right'  // 기본: 'left'
lh?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'  // line-height
```

### 특수 폰트 사용
```tsx
// KBODiaGothic-Bold 폰트
<AppText special="kboBold" size="lg">
  Revede
</AppText>
```

## 🏗 화면 컴포넌트 패턴

### Container/Presentational 분리

```tsx
// LoginContainer.tsx
export default function LoginContainer({ navigation }: any) {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    // 로직 처리
  };

  return <LoginView onLogin={handleLogin} />;
}

// LoginView.tsx
type LoginViewProps = {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  return (
    <Container>
      <Button onPress={onLogin}>로그인</Button>
    </Container>
  );
}
```

### Props 타입 정의
```tsx
type MyComponentProps = {
  title: string;
  onPress: () => void;
  isActive?: boolean;
}

export default function MyComponent({ title, onPress, isActive = false }: MyComponentProps) {
  // ...
}
```

## 📦 Import 규칙

### Import 순서
1. React 관련
2. 서드파티 라이브러리
3. 내부 모듈 (@/ alias)
4. 상대 경로
5. 타입 import

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/constants/theme';
import LoginView from './LoginView';
import type { User } from '@/types/auth';
```

### Path Alias 사용
```tsx
// ✅ 권장
import { theme } from '@/constants/theme';
import AppText from '@/components/AppText';

// ❌ 지양
import { theme } from '../../../constants/theme';
```

## 🔤 네이밍 컨벤션

### 변수/함수
```tsx
// camelCase
const userName = 'John';
const getUserData = async () => {};
const handleLoginPress = () => {};
```

### 상수
```tsx
// UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;
```

### 컴포넌트
```tsx
// PascalCase
function LoginContainer() {}
const MyButton = styled.TouchableOpacity``;
```

### Boolean
```tsx
// is-, has-, should- prefix
const isLoading = true;
const hasError = false;
const shouldShowModal = true;
```

### 이벤트 핸들러
```tsx
// handle- prefix (Container)
const handleLogin = () => {};
const handleSubmit = async () => {};

// on- prefix (View props)
<LoginView onLogin={handleLogin} />
```

## 💡 코드 스타일

### 조건부 렌더링
```tsx
// 단순 조건
{isLoading && <Spinner />}

// if-else
{isLoading ? <Spinner /> : <Content />}

// 복잡한 조건은 별도 함수로
const renderContent = () => {
  if (isLoading) return <Spinner />;
  if (hasError) return <Error />;
  return <Content />;
};
```

### 비동기 처리
```tsx
const fetchData = async () => {
  try {
    const response = await api.getData();
    setData(response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 📝 주석

### JSDoc 사용 (필요 시)
```tsx
/**
 * 사용자 로그인 처리
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @returns 로그인 성공 여부
 */
const login = async (email: string, password: string): Promise<boolean> => {
  // ...
};
```

### 복잡한 로직 설명
```tsx
// OAuth 리다이렉션 처리: 백엔드에서 토큰과 함께 리다이렉트됨
// snaplink://auth/login?token=xxx 형식으로 앱이 열림
if (token) {
  await signIn(token);
}
```
