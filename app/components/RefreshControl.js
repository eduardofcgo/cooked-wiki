import React from 'react'
import { RefreshControl } from 'react-native'

import { theme } from '../style/style'

export default function (props) {
  return <RefreshControl {...props} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
}
