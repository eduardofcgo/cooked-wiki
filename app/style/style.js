export const theme = {
  fontSizes: {
    small: 12,
    default: 15,
    large: 25,
  },
  opacity: {
    disabled: 0.33,
  },
  colors: {
    disabledBackground: 'rgba(0,0,0,0.5)',
    primary: '#d97757',
    secondary: '#efede3',
    background: '#fafaf7',
    black: '#292521',
    white: 'white',
    softBlack: '#706b57',
    border: '#ccc',
    pink: '#d87192',
    error: '#FF3B30',
  },
  fonts: {
    ui: 'AtkinsonHyperlegible_400Regular',
    uiBold: 'Atkinson Hyperlegible',
    title: 'EBGaramond_400Regular',
  },
  borderRadius: {
    default: 12,
    small: 5,
  },
}

export const titleStyle = {
  fontSize: theme.fontSizes.large,
  fontFamily: theme.fonts.title,
  fontWeight: 'normal',
}

export const screenStyle = {
  headerTitleStyle: titleStyle,
  headerStyle: {
    backgroundColor: theme.colors.secondary,
  },
  contentStyle: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}
