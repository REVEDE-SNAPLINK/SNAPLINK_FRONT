# 컴포넌트 가이드

## 🎯 공통 컴포넌트

### Typography

테마 및 폰트 크기 자동 스케일링이 적용된 공통 텍스트 컴포넌트입니다. 앱 내 모든 텍스트는 이 컴포넌트를 기반으로 렌더링해야 합니다.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fontSize` | `number` | - | 폰트 크기 (Figma px 값, 1.1배 자동 스케일링) |
| `color` | `string` | `'textPrimary'` | 텍스트 색상 (theme.colors 키 또는 직접 색상값) |
| `fontWeight` | `'thin' \| 'extraLight' \| 'light' \| 'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extraBold' \| 'black'` | `'regular'` | 폰트 굵기 (Pretendard 영문 매핑 계열) |
| `lineHeight` | `number \| string` | - | 줄 높이 (Figma px 값 또는 '%', 1.1배 스케일링 적용됨) |
| `letterSpacing` | `number \| string` | - | 자간 |
| `marginTop`, `marginBottom` | `number` | - | 위/아래 여백 |
| `marginLeft`, `marginRight` | `number` | - | 좌/우 여백 |
| `marginHorizontal`, `marginVertical` | `number` | - | 상하/좌우 여백 동시 설정 |

#### 사용 예시

```tsx
import { Typography } from '@/components/ui';

// 기본 사용
<Typography fontSize={14}>텍스트 내용</Typography>

// 크기와 굵기 지정
<Typography fontSize={16} fontWeight="semibold">
  제목 텍스트
</Typography>

// 색상 지정
<Typography fontSize={14} color="primary" fontWeight="bold">
  강조 텍스트
</Typography>

// 줄 높이와 자간 조정 (%)
<Typography fontSize={14} lineHeight="140%" letterSpacing={-0.5}>
  줄 간격이 적용된 텍스트
</Typography>

// 마진 사용
<Typography fontSize={14} marginTop={20} marginBottom={10}>
  상하단 마진이 적용된 텍스트
</Typography>

// 중첩 사용 (색상 혼합)
<Typography fontSize={16} fontWeight="bold">
  일반 텍스트 <Typography color="mint">포인트 컬러</Typography>
</Typography>
```

#### Color 목록 (theme.colors)

```typescript
// Brand colors
'mint'     // #30B090 (중간 민트)
'aqua'     // #54C1A1 (밝은 청록)
'teal'     // #74D9D1 (연한 티얼)
'lavender' // #A68CDA (연보라)
'sky'      // #A3D3F9 (하늘색)
'ice'      // #DBFBF9 (아주 옅은 민트)
'graphite' // #333D49 (짙은 회색)

// Semantic colors
'primary'  // #00A980
'disabled' // #C8C8C8
'error'    // #E53935

// Background colors
'bgPrimary'   // #FFFFFF
'bgSecondary' // #EAEAEA

// Text colors
'textPrimary'   // #2F2C2B
'textSecondary' // #3C3C3C
```

#### 폰트 굵기 (FontWeight) 참고

| Prop Value | Weight | Name |
|------------|--------|------|
| `thin` | 100 | Thin |
| `extraLight` | 200 | ExtraLight |
| `light` | 300 | Light |
| `regular` | 400 | Regular (기본) |
| `medium` | 500 | Medium |
| `semibold` | 600 | SemiBold |
| `bold` | 700 | Bold |
| `extraBold`| 800 | ExtraBold |
| `black` | 900 | Black |

## 🎨 styled-components 예제

### 기본 컴포넌트

```tsx
import { styled } from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';

// View
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.bgPrimary};
  padding: 16px; // CustomStyled가 스케일링을 자동으로 적용
`;

// ScrollView
const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

// SafeAreaView
const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${theme.colors.background};
`;

// TouchableOpacity
const Button = styled.TouchableOpacity`
  width: 335px;
  height: 55px;
  background-color: ${theme.colors.primary};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

// Image
const Logo = styled.Image`
  width: 100px;
  height: 100px;
  resize-mode: contain;
`;

// TextInput
const Input = styled.TextInput`
  width: 100%;
  height: 48px;
  background-color: ${theme.colors.bgSecondary};
  border-radius: 4px;
  padding-horizontal: 16px;
  font-size: 14px;
  color: ${theme.colors.textPrimary};
`;
```

### Props 기반 스타일링

```tsx
// boolean props
const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ disabled }) =>
    disabled ? theme.colors.disabled : theme.colors.primary};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

// 복잡한 props
const Container = styled.View<{ $variant: 'primary' | 'secondary' }>`
  background-color: ${({ $variant }) =>
    $variant === 'primary'
      ? theme.colors.primary
      : theme.colors.mint};
  padding: 16px;
`;

// 사용
<Button disabled={isLoading} />
<Container variant="primary" />
```

### 조건부 스타일

```tsx
const Text = styled.Text<{ isActive?: boolean }>`
  color: ${({ isActive }) =>
    isActive ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ isActive }) => isActive ? '700' : '400'};
`;
```

## 🔧 유틸리티 패턴

### 절대 위치 컴포넌트

```tsx
const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.colors.primary};
`;
```

### Flexbox 레이아웃

```tsx
// 세로 중앙 정렬
const CenterContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

// 가로 배치
const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

// space-between
const SpaceBetween = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
```

### 그림자 효과

```tsx
const Card = styled.View`
  background-color: ${theme.colors.bgPrimary};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08); // React Native 기본 혹은 box-shadow 스타일
`;

// 커스텀 그림자
const CustomCard = styled.View`
  background-color: ${theme.colors.background};
  ${boxShadow.get({ width: 5, height: 5, blur: 10, opacity: 0.15 })}
`;
```

## 📝 Best Practices

### 1. 컴포넌트 재사용
```tsx
// ✅ 재사용 가능한 버튼 컴포넌트
type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const CustomButton = ({ title, onPress, variant = 'primary' }: ButtonProps) => (
  <StyledButton $variant={variant} onPress={onPress}>
    <Typography color="bgPrimary" fontWeight="bold">{title}</Typography>
  </StyledButton>
);
```

### 2. 테마 값 사용
```tsx
// ✅ 테마 및 자동 스케일링 기입
background-color: ${theme.colors.primary};
padding: 16px; // CustomStyled 적용

// ❌ 하드코딩된 색상
background-color: #00A980;
```

### 3. 반응형 스케일링
```tsx
// ✅ 스케일링 사용
width: 335px; // CustomStyled 기반으로 자동 스케일링됨
font-size: 16px;

// ❌ 수동 함수 사용
width: ${theme.scale(335)}px;
font-size: ${theme.moderateScale(16)}px;
```

### 4. Typography 우선 사용
```tsx
// ✅ Typography 사용
<Typography fontSize={16} fontWeight="bold">제목</Typography>

// ❌ styled.Text 직접 사용
const Title = styled.Text`
  font-size: 16px;
  font-weight: 700;
`;
```
