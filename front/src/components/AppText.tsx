import React from "react";
import {Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, Platform} from 'react-native';
import { theme } from "@/constants/theme.ts";

type Weight = 100|200|300|400|500|600|700|800|900;
type SizeKey = keyof typeof theme.typography.size;
type ColorKey = keyof typeof theme.colors;
type LineHeightKey = keyof typeof theme.typography.lineHeight;

export type AppTextProps = RNTextProps & {
    /** Font size - xs(10px), sm(12px), md(14px), lg(16px), xl(22px), xxl(40px) */
    size?: SizeKey;
    color?: ColorKey;
    weight?: Weight;
    align?: TextStyle['textAlign'];
    /** Line height - xs(14px), sm(16px), md(20px), lg(22px), xl(28px), xxl(48px) */
    lh?: LineHeightKey;
    style?: TextStyle | TextStyle[];
}

export default function AppText({
    size = 'md',
    color = 'textPrimary',
    weight = 400,
    align = 'left',
    lh = 'md',
    special,
    style,
    allowFontScaling = true, // 접근성 기본 on,
    ...rest
}: AppTextProps) {
    const family = theme.typography.byWeightNumber[weight] ?? theme.typography.byWeightNumber[400];

    const fontSize = theme.typography.size[size];
    const lineHeight = lh ? theme.typography.lineHeight[lh] : theme.typography.lineHeight[size];

    const weightStyle: TextStyle =
        Platform.OS === 'ios'
        ? { fontWeight: String(weight) as TextStyle['fontWeight'] }
        : {};

    return (
        <RNText
            allowFontScaling={allowFontScaling}
            style={[
                styles.base,
                {
                    color: theme.colors[color],
                    fontFamily: family,
                    fontSize,
                    lineHeight,
                    textAlign: align,
                    fontWeight: weight,
                },
                weightStyle,
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