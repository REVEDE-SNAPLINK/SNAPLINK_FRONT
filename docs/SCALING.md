# 자동 스케일링 시스템

React Native 앱에서 다양한 화면 크기에 대응하기 위한 자동 스케일링 시스템입니다.

## 주요 기능

### 1. 자동 px 값 스케일링

모든 px 값이 화면 크기에 맞게 자동으로 조정됩니다.

```tsx
import { styled } from '@/utils/ScaledStyled';

const Container = styled.View`
  padding: 16px;        // ✅ 자동 스케일링 (spacing: 60%)
  border-radius: 8px;   // ✅ 자동 스케일링 (radius: 30%)
  font-size: 14px;      // ✅ 자동 스케일링 (font: 50%)
`;
```

### 2. CSS Shorthand 지원

CSS처럼 shorthand 표기법을 사용할 수 있습니다.

```tsx
// padding/margin shorthand
const Box = styled.View`
  padding: 10px;                    // 모든 방향 10px
  padding: 10px 20px;               // vertical 10px, horizontal 20px
  padding: 10px 20px 30px;          // top 10px, horizontal 20px, bottom 30px
  padding: 10px 20px 30px 40px;     // top, right, bottom, left
`;

const Card = styled.View`
  margin: 5px 10px;                 // vertical 5px, horizontal 10px
`;
```

### 3. React Native 전용 속성 지원

kebab-case로 React Native 전용 속성을 작성할 수 있습니다.

```tsx
const Container = styled.View`
  padding-horizontal: 20px;   // paddingHorizontal로 변환 후 스케일링
  padding-vertical: 10px;     // paddingVertical로 변환 후 스케일링
  margin-horizontal: 16px;    // marginHorizontal로 변환 후 스케일링
  margin-vertical: 8px;       // marginVertical로 변환 후 스케일링
`;
```

## 스케일 규칙

각 속성 타입별로 다른 스케일 비율이 적용됩니다:

| 타입 | Factor | 적용 속성 | 이유 |
|------|--------|----------|------|
| **font** | 50% | fontSize, lineHeight, letterSpacing | 폰트는 과도한 스케일링 방지 |
| **spacing** | 60% | padding, margin, width, height, gap 등 | 적당한 여백 조정 |
| **icon** | 80% | (수동 사용) | 아이콘은 비교적 크게 스케일 |
| **radius** | 30% | borderRadius 계열 | radius는 미세하게 조정 |

## 사용 예시

### 기본 사용

```tsx
import { styled } from '@/utils/scale/CustomStyled';

const Header = styled.View`
  padding: 20px;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 12px;
`;

const Button = styled.TouchableOpacity`
  padding: 12px 24px;
  border-radius: 8px;
  background-color: #007AFF;
`;
```

### 컴포넌트 래핑

```tsx
import { styled } from '@/utils/scale/CustomStyled';
import { SafeAreaView } from 'react-native-safe-area-context';

const SafeContainer = styled(SafeAreaView)`
  flex: 1;
  padding-horizontal: 16px;
`;
```

### Props와 함께 사용

```tsx
const Card = styled.View<{ $highlighted: boolean }>`
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ $highlighted }) =>
    $highlighted ? '#E3F2FD' : '#FFFFFF'
  };
`;
```

### 수동 스케일링 (특수한 경우)

자동 스케일링 외에 수동으로 제어가 필요한 경우:

```tsx
import { styled, s } from '@/utils/scale/CustomStyled';

const Icon = styled.Image`
  width: ${s.icon(24)}px;      // icon 타입으로 스케일링 (80%)
  height: ${s.icon(24)}px;
`;

const CustomBox = styled.View`
  padding: ${s.spacing(16)}px;  // 명시적으로 spacing 스케일 사용
`;
```

## 작동 원리

1. **템플릿 파싱**: CSS 문자열에서 px 값을 감지
2. **Shorthand 확장**: `padding: 10px 20px` → `padding-vertical: 10px; padding-horizontal: 20px`
3. **속성 변환**: `padding-horizontal` → `paddingHorizontal`
4. **스케일 적용**: 속성 타입에 맞는 스케일 비율 적용
5. **최종 변환**: 스케일링된 값으로 치환

## 기술 스택

- **Proxy**: styled-components의 모든 메서드를 가로채서 자동 처리
- **정규표현식**: CSS 문자열 파싱 및 변환
- **Dimensions API**: 현재 화면 크기 기반 스케일 계산

## 참고사항

### 스케일링이 적용되지 않는 경우

- `%`, `em`, `rem` 등 다른 단위
- 색상 값 (예: `#FFFFFF`)
- 문자열 값 (예: `'center'`, `'flex-start'`)

### 스케일링 비활성화

특정 값에 스케일링을 적용하고 싶지 않다면 px 대신 숫자만 사용:

```tsx
const Fixed = styled.View`
  width: 100px;      // ✅ 스케일링 적용
  height: ${100};    // ❌ 스케일링 미적용 (숫자만)
`;
```

## 파일 구조

```
src/utils/scale/
├── scale.ts              # 스케일 계산 로직
├── CustomStyled.ts       # 자동 스케일링 styled 래퍼
└── SCALING.md           # 이 문서
```
