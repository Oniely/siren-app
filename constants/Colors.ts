/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#3998ff';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#343434',
    background: '#faf9f6',
    tint: tintColorLight,
    icon: '#b6b67',
    tabIconDefault: '#e6e6e6',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#0c0c63',
    background: '#d7f1f7',
    tint: tintColorDark,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorDark,
  },
};
