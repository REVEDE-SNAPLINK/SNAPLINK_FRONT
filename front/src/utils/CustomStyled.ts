import styledNative, { css as cssNative } from "styled-components/native";
import { Platform } from "react-native";
import { scaleByType, scaleRules } from "./scale";

/**
 * CSS 속성별 스케일 타입 매핑
 * 각 속성이 어떤 종류의 스케일링을 받을지 정의
 */
const PROPERTY_SCALE_MAP: Record<string, keyof typeof scaleRules> = {
  // Font 관련 (50% 적용)
  fontSize: "font",
  letterSpacing: "font",
  lineHeight: "font",

  // Spacing 관련 (60% 적용)
  width: "spacing",
  height: "spacing",
  minWidth: "spacing",
  minHeight: "spacing",
  maxWidth: "spacing",
  maxHeight: "spacing",
  top: "spacing",
  bottom: "spacing",
  left: "spacing",
  right: "spacing",
  margin: "spacing",
  marginTop: "spacing",
  marginBottom: "spacing",
  marginLeft: "spacing",
  marginRight: "spacing",
  marginVertical: "spacing",
  marginHorizontal: "spacing",
  padding: "spacing",
  paddingTop: "spacing",
  paddingBottom: "spacing",
  paddingLeft: "spacing",
  paddingRight: "spacing",
  paddingVertical: "spacing",
  paddingHorizontal: "spacing",
  gap: "spacing",
  rowGap: "spacing",
  columnGap: "spacing",

  // Radius 관련 (30% 적용)
  borderRadius: "radius",
  borderTopLeftRadius: "radius",
  borderTopRightRadius: "radius",
  borderBottomLeftRadius: "radius",
  borderBottomRightRadius: "radius",
  borderTopStartRadius: "radius",
  borderTopEndRadius: "radius",
  borderBottomStartRadius: "radius",
  borderBottomEndRadius: "radius",

  // Shadow 관련 (spacing과 동일하게 60% 적용)
  shadowOffset: "spacing",
  shadowRadius: "spacing",
  elevation: "spacing",
};

/**
 * 스케일링 헬퍼 함수
 * styled-components 내부에서 사용할 수 있는 스케일링 함수들
 *
 * @example
 * ```tsx
 * const Text = styled.Text`
 *   font-size: ${s.font(14)}px;
 *   padding: ${s.spacing(16)}px;
 * `;
 * ```
 */
export const s = {
  /** Font 스케일링 (50%) */
  font: (size: number) => scaleByType(size, 'font'),

  /** Spacing 스케일링 (60%) */
  spacing: (size: number) => scaleByType(size, 'spacing'),

  /** Icon 스케일링 (80%) */
  icon: (size: number) => scaleByType(size, 'icon'),

  /** Radius 스케일링 (30%) */
  radius: (size: number) => scaleByType(size, 'radius'),
};

/**
 * React Native 전용 속성 변환
 * CSS 스타일 -> React Native camelCase 속성
 */
const RN_PROPERTY_MAP: Record<string, string> = {
  'padding-horizontal': 'paddingHorizontal',
  'padding-vertical': 'paddingVertical',
  'margin-horizontal': 'marginHorizontal',
  'margin-vertical': 'marginVertical',
};

/**
 * box-shadow CSS 파싱
 * 예: "0px 2px 4px rgba(0, 0, 0, 0.1)" -> { offsetX, offsetY, blurRadius, color }
 */
interface ParsedBoxShadow {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius?: number;
  color: string;
}

function parseBoxShadow(value: string): ParsedBoxShadow | null {
  // box-shadow: offsetX offsetY blurRadius spreadRadius? color
  // 예: "0px 2px 4px 0px rgba(0, 0, 0, 0.1)"
  // 예: "0px 2px 4px rgba(0, 0, 0, 0.1)"
  const match = value.match(
    /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-z]+)/
  );

  if (!match) return null;

  const [, offsetX, offsetY, blurRadius, spreadRadius, color] = match;

  return {
    offsetX: parseFloat(offsetX),
    offsetY: parseFloat(offsetY),
    blurRadius: parseFloat(blurRadius),
    spreadRadius: spreadRadius ? parseFloat(spreadRadius) : undefined,
    color: color.trim(),
  };
}

/**
 * box-shadow를 플랫폼별 shadow 속성으로 변환
 */
function convertBoxShadowToPlatform(shadow: ParsedBoxShadow): string {
  const scaledOffsetX = scaleByType(shadow.offsetX, 'spacing');
  const scaledOffsetY = scaleByType(shadow.offsetY, 'spacing');
  const scaledBlurRadius = scaleByType(shadow.blurRadius, 'spacing');

  if (Platform.OS === 'ios') {
    // iOS는 shadowOffset, shadowRadius, shadowColor, shadowOpacity 사용
    let opacity = 1;
    let color = shadow.color;

    // rgba에서 opacity 추출
    const rgbaMatch = shadow.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      opacity = a ? parseFloat(a) : 1;
      color = `rgb(${r}, ${g}, ${b})`;
    }

    return `
      shadow-color: ${color};
      shadow-offset: ${scaledOffsetX}px ${scaledOffsetY}px;
      shadow-opacity: ${opacity};
      shadow-radius: ${scaledBlurRadius}px;
    `;
  } else {
    // Android는 elevation 사용
    // blurRadius를 기준으로 elevation 계산
    const elevation = Math.max(scaledBlurRadius / 2, 1);

    return `elevation: ${elevation};`;
  }
}

/**
 * CSS shorthand를 개별 속성으로 확장
 * 예: "padding: 10px 20px" -> "padding-top: 10px; padding-right: 20px; ..."
 */
function expandShorthand(css: string): string {
  // padding: 10px 20px 30px 40px -> padding-top, padding-right, padding-bottom, padding-left
  css = css.replace(
    /padding\s*:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
    (_, top, right, bottom, left) =>
      `padding-top: ${top}px; padding-right: ${right}px; padding-bottom: ${bottom}px; padding-left: ${left}px`
  );

  // padding: 10px 20px 30px -> padding-top, padding-right/left, padding-bottom
  css = css.replace(
    /padding\s*:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
    (_, top, horizontal, bottom) =>
      `padding-top: ${top}px; padding-right: ${horizontal}px; padding-bottom: ${bottom}px; padding-left: ${horizontal}px`
  );

  // padding: 10px 20px -> padding-vertical, padding-horizontal
  css = css.replace(
    /padding\s*:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
    (_, vertical, horizontal) =>
      `padding-vertical: ${vertical}px; padding-horizontal: ${horizontal}px`
  );

  // padding: 10px -> 모든 방향 동일
  css = css.replace(
    /padding\s*:\s*(\d+(?:\.\d+)?)px(?:\s|;|$)/g,
    (_, value) =>
      `padding-top: ${value}px; padding-right: ${value}px; padding-bottom: ${value}px; padding-left: ${value}px;`
  );

  // margin: 10px 20px 30px 40px
  css = css.replace(
    /margin\s*:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
    (_, top, right, bottom, left) =>
      `margin-top: ${top}px; margin-right: ${right}px; margin-bottom: ${bottom}px; margin-left: ${left}px`
  );

  // margin: 10px 20px 30px
  css = css.replace(
    /margin\s*:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
    (_, top, horizontal, bottom) =>
      `margin-top: ${top}px; margin-right: ${horizontal}px; margin-bottom: ${bottom}px; margin-left: ${horizontal}px`
  );

  // margin: 10px 20px
  css = css.replace(
    /margin\s*:\s*(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/g,
    (_, vertical, horizontal) =>
      `margin-vertical: ${vertical}px; margin-horizontal: ${horizontal}px`
  );

  // margin: 10px
  css = css.replace(
    /margin\s*:\s*(\d+(?:\.\d+)?)px(?:\s|;|$)/g,
    (_, value) =>
      `margin-top: ${value}px; margin-right: ${value}px; margin-bottom: ${value}px; margin-left: ${value}px;`
  );

  // box-shadow 변환
  css = css.replace(
    /box-shadow\s*:\s*([^;]+);?/g,
    (_, shadowValue) => {
      const parsed = parseBoxShadow(shadowValue.trim());
      if (parsed) {
        return convertBoxShadowToPlatform(parsed);
      }
      return '';
    }
  );

  return css;
}

/**
 * CSS 문자열에서 숫자 px 값을 찾아서 스케일링 적용
 * interpolation은 보존하여 동적 값을 유지
 */
function applyAutoScaling(strings: TemplateStringsArray): TemplateStringsArray {
  const processedStrings: string[] = [];

  strings.forEach((str) => {
    // 각 문자열 부분을 처리
    let processed = str;

    // 1. CSS shorthand를 개별 속성으로 확장 (box-shadow 포함)
    processed = expandShorthand(processed);

    // 2. React Native 전용 속성 변환
    Object.entries(RN_PROPERTY_MAP).forEach(([cssProperty, rnProperty]) => {
      const regex = new RegExp(cssProperty, 'g');
      processed = processed.replace(regex, rnProperty);
    });

    // 3. 정적 px 값만 스케일링 (동적 값은 그대로 유지)
    processed = processed.replace(
      /([a-zA-Z-]+)\s*:\s*(\d+(?:\.\d+)?)px/g,
      (match, property, value) => {
        const scaleType = PROPERTY_SCALE_MAP[property];
        if (scaleType) {
          const scaled = scaleByType(Number(value), scaleType);
          return `${property}: ${scaled}px`;
        }
        return match;
      }
    );

    processedStrings.push(processed);
  });

  // TemplateStringsArray로 변환
  const result = processedStrings as any;
  result.raw = processedStrings;
  return result;
}

/**
 * styled-components를 래핑하여 자동 스케일링 적용
 */
function createAutoScaledStyled(componentCreator: any): any {
  return (strings: TemplateStringsArray, ...interpolations: any[]) => {
    // 문자열 부분만 스케일링 적용, interpolation은 그대로 전달
    const scaledStrings = applyAutoScaling(strings);

    // styled-components에 원래 형태로 전달
    return componentCreator(scaledStrings, ...interpolations);
  };
}

/**
 * Proxy를 사용하여 styled의 모든 컴포넌트에 자동 스케일링 적용
 *
 * @example
 * ```tsx
 * // 1. 기본 사용 - 자동 스케일링
 * const Container = styled.View`
 *   padding: 16px;           // 자동으로 s.spacing(16) 적용
 *   border-radius: 8px;      // 자동으로 s.radius(8) 적용
 *   font-size: 14px;         // 자동으로 s.font(14) 적용
 * `;
 *
 * // 2. CSS shorthand 지원
 * const Box = styled.View`
 *   padding: 10px 20px;      // padding-vertical: 10px, padding-horizontal: 20px로 변환
 *   margin: 5px 10px 15px;   // margin-top, margin-right/left, margin-bottom으로 변환
 * `;
 *
 * // 3. React Native 전용 속성 지원
 * const Card = styled.View`
 *   padding-horizontal: 20px;  // paddingHorizontal로 변환 후 스케일링
 *   padding-vertical: 10px;    // paddingVertical로 변환 후 스케일링
 *   margin-horizontal: 16px;   // marginHorizontal로 변환 후 스케일링
 * `;
 *
 * // 4. box-shadow 크로스 플랫폼 지원
 * const Shadow = styled.View`
 *   box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
 *   // iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius로 변환
 *   // Android: elevation으로 변환
 * `;
 *
 * // 5. 모든 컴포넌트에 동작
 * const Text = styled.Text`...`;
 * const Safe = styled(SafeAreaView)`...`;
 * ```
 */
export const styled = new Proxy(styledNative, {
  get(target, prop) {
    if (prop === 'default') {
      return (target as any)[prop];
    }

    const original = (target as any)[prop];

    // 함수가 아니면 그대로 반환 (attrs, withConfig 등)
    if (typeof original !== 'function') {
      return original;
    }

    // styled.View, styled.Text 등의 호출을 가로채서 자동 스케일링 적용
    return (...args: any[]) => {
      // 첫 번째 인자가 TemplateStringsArray인 경우 (tagged template literal)
      if (args[0] && args[0].raw) {
        return createAutoScaledStyled(original.bind(target))(...args);
      }

      // styled(Component) 형태인 경우
      const component = args[0];
      const styledComponent = original.call(target, component);

      // 반환된 함수도 래핑
      return (strings: TemplateStringsArray, ...interpolations: any[]) => {
        const scaledStrings = applyAutoScaling(strings);
        return styledComponent(scaledStrings, ...interpolations);
      };
    };
  },
}) as typeof styledNative;

/**
 * css 헬퍼 - 재사용 가능한 스타일을 만들 때 사용
 * 자동 스케일링이 적용됩니다
 *
 * @example
 * ```tsx
 * const flexCenter = css`
 *   justify-content: center;
 *   align-items: center;
 * `;
 *
 * const Container = styled.View`
 *   ${flexCenter}
 *   padding: 16px;
 * `;
 * ```
 */
export const css = (strings: TemplateStringsArray, ...interpolations: any[]) => {
  const scaledStrings = applyAutoScaling(strings);
  return cssNative(scaledStrings, ...interpolations);
};

// 기본 export
export default styled;
