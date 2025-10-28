# 컴포넌트 가이드

## 🎯 공통 컴포넌트

### AppText

테마 기반 텍스트 컴포넌트. 모든 텍스트는 이 컴포넌트를 사용해야 합니다.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fontSize` | `number` | - | 폰트 크기 (Figma px 값) |
| `color` | `ColorKey \| string` | `'textPrimary'` | 텍스트 색상 (theme.colors 키 또는 직접 색상값) |
| `fontWeight` | `100 \| 200 \| ... \| 900` | `400` | 폰트 굵기 (Pretendard) |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'` | 텍스트 정렬 |
| `lineHeight` | `number` | - | 줄 높이 (Figma px 값, verticalScale 적용됨) |
| `letterSpacing` | `number` | - | 자간 (Figma px 값, horizontalScale 적용됨) |
| `special` | `'kboBold'` | - | 특수 폰트 (KBODiaGothic-Bold) |
| `textDecorationLine` | `'none' \| 'underline' \| 'line-through'` | - | 텍스트 장식선 |
| `textTransform` | `'none' \| 'uppercase' \| 'lowercase' \| 'capitalize'` | - | 텍스트 변환 |
| `marginTop` | `number` | - | 상단 마진 (Figma px 값, verticalScale 적용됨) |
| `marginBottom` | `number` | - | 하단 마진 (Figma px 값, verticalScale 적용됨) |
| `marginLeft` | `number` | - | 좌측 마진 (Figma px 값, horizontalScale 적용됨) |
| `marginRight` | `number` | - | 우측 마진 (Figma px 값, horizontalScale 적용됨) |
| `marginHorizontal` | `number` | - | 좌우 마진 (Figma px 값, horizontalScale 적용됨) |
| `marginVertical` | `number` | - | 상하 마진 (Figma px 값, verticalScale 적용됨) |
| `style` | `TextStyle` | - | 추가 스타일 (inline) |

#### 사용 예시

```tsx
import AppText from '@/components/AppText';

// 기본 사용
<AppText fontSize={14}>텍스트 내용</AppText>

// 크기와 굵기 지정
<AppText fontSize={16} fontWeight={700}>
  제목 텍스트
</AppText>

// 색상 지정
<AppText fontSize={14} color="primary" fontWeight={600}>
  강조 텍스트
</AppText>

// 특수 폰트 사용
<AppText special="kboBold" fontSize={22}>
  Revede
</AppText>

// 줄 높이와 자간 조정
<AppText fontSize={14} lineHeight={20} letterSpacing={-0.5}>
  줄 간격이 넓은 텍스트
</AppText>

// 마진 사용 (반응형 스케일링 자동 적용)
<AppText fontSize={14} marginTop={20} marginBottom={10}>
  마진이 적용된 텍스트
</AppText>

<AppText fontSize={16} marginVertical={15} marginHorizontal={20}>
  상하좌우 마진이 적용된 텍스트
</AppText>

// 중첩 사용 (색상 혼합)
<AppText fontSize={16} fontWeight={700}>
  일반 텍스트 <AppText color="primary">강조 부분</AppText>
</AppText>

// 텍스트 장식
<AppText
  fontSize={14}
  textDecorationLine="underline"
  textTransform="uppercase"
>
  밑줄과 대문자 변환
</AppText>

// inline style 추가 (최소한으로 사용)
<AppText
  fontSize={14}
  style={{
    opacity: 0.7
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
'formBackground'    // #F4F4F4
'inputBackground'   // #EAEAEA
'selected'     // #ECECEC
'disabled'     // #A4A4A4

// Text colors
'textSecondary' // #646161

// Placeholder colors
'placeholder'    // #767676

// Other colors
'black'    // #000000
'white'    // #FFFFFF
'yellow'   // #FFB23F
'red'      // #E84E4E
'shadow'   // rgba(0, 0, 0, 0.08)
```

#### 폰트 크기 참고

| Pixel | Use Case |
|-------|----------|
| 10px | 작은 캡션 |
| 12px | 캡션, 부가 정보 |
| 14px | 본문 (기본) |
| 16px | 부제목 |
| 22px | 제목 |
| 40px | 대형 타이틀 |

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
<AppText fontSize={16} fontWeight={700}>제목</AppText>

// ❌ styled.Text 직접 사용
const Title = styled.Text`
  font-size: 16px;
  font-weight: 700;
`;
```
