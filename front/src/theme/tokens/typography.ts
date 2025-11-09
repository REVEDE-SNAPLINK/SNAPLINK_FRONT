const emToPx = (em: number, fontSize: number) => fontSize * em;

export const typography = {
  display1: (() => {
    const fontSize = 56;
    return {
      fontSize,
      lineHeight: 72,
      letterSpacing: emToPx(-0.0319, fontSize),
    }
  })(),
  display2: (() => {
    const fontSize = 40;
    return {
      fontSize,
      lineHeight: 52,
      letterSpacing: emToPx(-0.0282, fontSize),
    }
  })(),
  title1: (() => {
    const fontSize = 36;
    return {
      fontSize,
      lineHeight: 48,
      letterSpacing: emToPx(-0.027, fontSize),
    }
  })(),
  title2: (() => {
    const fontSize = 28;
    return {
      fontSize,
      lineHeight: 38,
      letterSpacing: emToPx(-0.0236, fontSize),
    }
  })(),
  title3: (() => {
    const fontSize = 24;
    return {
      fontSize,
      lineHeight: 32,
      letterSpacing: emToPx(-0.023, fontSize),
    }
  })(),
  heading1: (() => {
    const fontSize = 22;
    return {
      fontSize,
      lineHeight: 30,
      letterSpacing: emToPx(-0.0194, fontSize),
    }
  })(),
  heading2: (() => {
    const fontSize = 20;
    return {
      fontSize,
      lineHeight: 28,
      letterSpacing: emToPx(-0.012, fontSize),
    }
  })(),
  headline1: (() => {
    const fontSize = 22;
    return {
      fontSize,
      lineHeight: 30,
      letterSpacing: emToPx(-0.0194, fontSize),
    }
  })(),
  headline2: (() => {
    const fontSize = 17;
    return {
      fontSize,
      lineHeight: 24,
      letterSpacing: emToPx(0, fontSize),
    }
  })(),
  body1Normal: (() => {
    const fontSize = 16;
    return {
      fontSize,
      lineHeight: 24,
      letterSpacing: emToPx(0.0057, fontSize),
    }
  })(),
  body1Reading: (() => {
    const fontSize = 16;
    return {
      fontSize,
      lineHeight: 26,
      letterSpacing: emToPx(0.0057, fontSize),
    }
  })(),
  body2Normal: (() => {
    const fontSize = 15;
    return {
      fontSize,
      lineHeight: 22,
      letterSpacing: emToPx(0.0096, fontSize),
    }
  })(),
  body2Reading: (() => {
    const fontSize = 15;
    return {
      fontSize,
      lineHeight: 24,
      letterSpacing: emToPx(0.0096, fontSize),
    }
  })(),
  label1Normal: (() => {
    const fontSize = 14;
    return {
      fontSize,
      lineHeight: 20,
      letterSpacing: emToPx(0.0145, fontSize),
    }
  })(),
  label1Reading: (() => {
    const fontSize = 14;
    return {
      fontSize,
      lineHeight: 22,
      letterSpacing: emToPx(0.0145, fontSize),
    }
  })(),
  label2: (() => {
    const fontSize = 13;
    return {
      fontSize,
      lineHeight: 18,
      letterSpacing: emToPx(0.0194, fontSize),
    }
  })(),
  caption1: (() => {
    const fontSize = 12;
    return {
      fontSize,
      lineHeight: 16,
      letterSpacing: emToPx(0.0252, fontSize),
    }
  })(),
  caption2: (() => {
    const fontSize = 11;
    return {
      fontSize,
      lineHeight: 14,
      letterSpacing: emToPx(0.0311, fontSize),
    }
  })(),
}