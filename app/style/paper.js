import { MD3LightTheme } from 'react-native-paper'

import { theme } from './style'

const paperTheme = {
  ...MD3LightTheme,
  roundness: theme.borderRadius.default,
  fonts: {
    ...MD3LightTheme.fonts,
    labelLarge: {
      fontSize: theme.fontSizes.default,
    },
    bodyLarge: {
      fontSize: theme.fontSizes.default,
      fontFamily: theme.fonts.ui,
    },
    bodyMedium: {
      fontSize: theme.fontSizes.default,
      fontFamily: theme.fonts.ui,
    },
    body: {
      fontSize: theme.fontSizes.default,
      fontFamily: theme.fonts.ui,
    },
  },
  colors: {
    ...MD3LightTheme.colors,
    onSurface: theme.colors.softBlack,
    onBackground: theme.colors.softBlack,
    primary: theme.colors.softBlack,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level2: theme.colors.background,
    },
  },
}

export default paperTheme
