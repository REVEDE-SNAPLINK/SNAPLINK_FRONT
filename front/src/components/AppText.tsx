import React from "react";
import {Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, Platform} from 'react-native';
import { theme } from "@/constants/theme.ts";

type Weight = 100|200|300|400|500|600|700|800|900;
type ColorKey = keyof typeof theme.colors;
type SpecialFontKey = keyof typeof theme.typography.special;

export type AppTextProps = RNTextProps & {
    /** Font size - theme key or number (Figma px value) */
    fontSize?: number;

    /** Color - theme key or hex/rgba string */
    color?: ColorKey | string;

    /** Font weight */
    fontWeight?: Weight;

    /** Text alignment */
    textAlign?: TextStyle['textAlign'];

    /** Line height - number (Figma px value) */
    lineHeight?: number;

    /** Letter spacing - number (Figma px value) */
    letterSpacing?: number;

    /** Special fonts - kboBold(KBODiaGothic-Bold) */
    special?: SpecialFontKey;

    /** Text decoration */
    textDecorationLine?: TextStyle['textDecorationLine'];

    /** Text transform */
    textTransform?: TextStyle['textTransform'];

    /** Margin */
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    marginHorizontal?: number;
    marginVertical?: number;

    style?: TextStyle | TextStyle[];
}

export default function AppText({
    fontSize = 14,
    color = 'textPrimary',
    fontWeight = 400,
    textAlign = 'left',
    lineHeight,
    letterSpacing,
    special,
    textDecorationLine,
    textTransform,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    style,
    allowFontScaling = true,
    ...rest
}: AppTextProps) {
    const family = special
        ? theme.typography.special[special]
        : theme.typography.byWeightNumber[fontWeight] ?? theme.typography.byWeightNumber[400];

    // color: theme key인지 확인, 아니면 직접 색상값
    const finalColor = color in theme.colors
        ? theme.colors[color as ColorKey]
        : color;

    // lineHeight: 직접 지정값, verticalScale 적용
    const finalLineHeight = lineHeight
        ? theme.verticalScale(lineHeight)
        : undefined;

    // letterSpacing: 직접 지정값, scale 적용
    const finalLetterSpacing = letterSpacing
        ? theme.horizontalScale(letterSpacing)
        : undefined;

    const weightStyle: TextStyle =
        Platform.OS === 'ios' && !special
        ? { fontWeight: String(fontWeight) as TextStyle['fontWeight'] }
        : {};

    const textStyle: TextStyle = {
        color: finalColor,
        fontFamily: family,
        fontSize: fontSize,
        textAlign,
        fontWeight: fontWeight,
        ...(finalLineHeight && { lineHeight: finalLineHeight }),
        ...(finalLetterSpacing && { letterSpacing: finalLetterSpacing }),
        ...(textDecorationLine && { textDecorationLine }),
        ...(textTransform && { textTransform }),
    };

    const marginStyle: TextStyle = {
        ...(marginTop !== undefined && { marginTop: theme.verticalScale(marginTop) }),
        ...(marginBottom !== undefined && { marginBottom: theme.verticalScale(marginBottom) }),
        ...(marginLeft !== undefined && { marginLeft: theme.horizontalScale(marginLeft) }),
        ...(marginRight !== undefined && { marginRight: theme.horizontalScale(marginRight) }),
        ...(marginHorizontal !== undefined && { marginHorizontal: theme.horizontalScale(marginHorizontal) }),
        ...(marginVertical !== undefined && { marginVertical: theme.verticalScale(marginVertical) }),
    };

    return (
        <RNText
            allowFontScaling={allowFontScaling}
            style={[
                styles.base,
                textStyle,
                weightStyle,
                marginStyle,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        includeFontPadding: false,
        textAlignVertical: 'center'
    }
})