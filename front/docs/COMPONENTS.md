# 컴포넌트 가이드

## 🎯 공통 컴포넌트

### AppText

테마 기반 텍스트 컴포넌트. 모든 텍스트는 이 컴포넌트를 사용해야 합니다.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | 폰트 크기 (10px ~ 40px) |
| `weight` | `100 \| 200 \| ... \| 900` | `400` | 폰트 굵기 (Pretendard) |
| `color` | `ColorKey` | `'textPrimary'` | 텍스트 색상 (theme.colors) |
| `special` | `'kboBold'` | - | 특수 폰트 (KBODiaGothic-Bold) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 텍스트 정렬 |
| `lh` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | 줄 높이 |
| `style` | `TextStyle` | - | 추가 스타일 (inline) |

#### 사용 예시

```tsx
import AppText from '@/components/AppText';

// 기본 사용
<AppText>텍스트 내용</AppText>

// 크기와 굵기 지정
<AppText size="lg" weight={700}>
  제목 텍스트
</AppText>

// 색상 지정
<AppText color="primary" weight={600}>
  강조 텍스트
</AppText>

// 특수 폰트 사용
<AppText special="kboBold" size="xl">
  Revede
</AppText>

// 줄 높이 조정
<AppText size="md" lh="lg">
  줄 간격이 넓은 텍스트
</AppText>

// 중첩 사용 (색상 혼합)
<AppText size="lg" weight={700}>
  일반 텍스트 <AppText color="primary">강조 부분</AppText>
</AppText>

// inline style 추가 (최소한으로 사용)
<AppText
  size="md"
  style={{
    letterSpacing: theme.scale(-0.5),
    textDecorationLine: 'underline'
  }}
>
  추가 스타일이 필요한 텍스트
</AppText>
```

#### ColorKey 목록

```typescript
// Brand colors
'primary'      // #54C1A1
'secondary'    // #30B090
'tertiary'     // #333D49

// Surface colors
'background'   // #FFFFFF
'formBackground'    // #F4F4F4
'inputBackground'   // #EAEAEA
'selected'     // #ECECEC
'disabled'     // #A4A4A4

// Text colors
'textPrimary'   // #000000
'textSecondary' // #646161

// Placeholder colors
'placeholder'    // #767676
'placeholderDim' // #545454

// Other colors
'yellow'  // #FFB23F
'red'     // #E84E4E
```

#### 폰트 크기 참고

| Size | Pixel | Use Case |
|------|-------|----------|
| `xs` | 10px | 작은 캡션 |
| `sm` | 12px | 캡션, 부가 정보 |
| `md` | 14px | 본문 (기본) |
| `lg` | 16px | 부제목 |
| `xl` | 22px | 제목 |
| `xxl` | 40px | 대형 타이틀 |

#### 폰트 굵기 참고

| Weight | Name | Use Case |
|--------|------|----------|
| 100 | Thin | 극도로 얇은 텍스트 |
| 300 | Light | 가벼운 텍스트 |
| 400 | Regular | 기본 본문 |
| 500 | Medium | 약간 강조 |
| 600 | SemiBold | 부제목 |
| 700 | Bold | 제목, 강조 |
| 800 | ExtraBold | 강한 강조 |
| 900 | Black | 최대 굵기 |

## 🎨 styled-components 예제

### 기본 컴포넌트

```tsx
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';

// View
const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md}px;
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
  width: ${theme.scale(335)}px;
  height: ${theme.verticalScale(55)}px;
  background-color: ${theme.colors.primary};
  border-radius: ${theme.radius.md}px;
  align-items: center;
  justify-content: center;
`;

// Image
const Logo = styled.Image`
  width: ${theme.scale(100)}px;
  height: ${theme.scale(100)}px;
  resize-mode: contain;
`;

// TextInput
const Input = styled.TextInput`
  width: 100%;
  height: ${theme.verticalScale(48)}px;
  background-color: ${theme.colors.inputBackground};
  border-radius: ${theme.radius.sm}px;
  padding-horizontal: ${theme.spacing.md}px;
  font-size: ${theme.typography.size.md}px;
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
const Container = styled.View<{ variant: 'primary' | 'secondary' }>`
  background-color: ${({ variant }) =>
    variant === 'primary'
      ? theme.colors.primary
      : theme.colors.secondary};
  padding: ${theme.spacing.md}px;
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
  bottom: ${theme.verticalScale(20)}px;
  right: ${theme.scale(20)}px;
  width: ${theme.scale(56)}px;
  height: ${theme.scale(56)}px;
  border-radius: ${theme.scale(28)}px;
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
  gap: ${theme.spacing.sm}px;
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
import { boxShadow } from '@/constants/theme';

const Card = styled.View`
  background-color: ${theme.colors.background};
  border-radius: ${theme.radius.lg}px;
  padding: ${theme.spacing.md}px;
  ${boxShadow.default}
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
  <StyledButton variant={variant} onPress={onPress}>
    <AppText color="background" weight={700}>{title}</AppText>
  </StyledButton>
);
```

### 2. 테마 값 사용
```tsx
// ✅ 테마 사용
background-color: ${theme.colors.primary};
padding: ${theme.spacing.md}px;

// ❌ 하드코딩
background-color: #54C1A1;
padding: 16px;
```

### 3. 반응형 스케일링
```tsx
// ✅ 스케일링 사용
width: ${theme.scale(335)}px;
font-size: ${theme.moderateScale(16)}px;

// ❌ 고정 값
width: 335px;
font-size: 16px;
```

### 4. AppText 우선 사용
```tsx
// ✅ AppText 사용
<AppText size="lg" weight={700}>제목</AppText>

// ❌ styled.Text 직접 사용
const Title = styled.Text`
  font-size: 16px;
  font-weight: 700;
`;
```
