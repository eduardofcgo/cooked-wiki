export const theme = {
  fontSizes: {
    small: 12,
    default: 16,
  },
  colors: {
    primary: '#d97757',
    secondary: '#efede3',
    background: '#fafaf7',
    black: '#292521',
    white: 'white',
    softBlack: '#706b57',
  },
  fonts: {
    title: 'EBGaramond',
    primary: 'EBGaramond',
  },
  borderRadius: {
    default: 12,
    small: 5,
  },
}

export const titleStyle = {
  fontSize: 25,
  fontFamily: theme.fonts.title,
  fontWeight: 'normal',
}

export const screenStyle = {
  headerTitleStyle: titleStyle,
  headerStyle: {
    backgroundColor: theme.colors.secondary,
  },
}
