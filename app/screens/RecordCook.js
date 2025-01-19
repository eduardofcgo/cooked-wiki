import React from 'react'
import { View } from 'react-native'
import RecordCook from '../components/RecordCook/RecordCook'
import FadeInStatusBar from '../components/FadeInStatusBar'
import { theme } from '../style/style'

export default function RecordCookScreen({ navigation, route }) {
  return (
    <>
      <FadeInStatusBar color={theme.colors.background} />
      <RecordCook 
        navigation={navigation}
        route={route}
        editMode={false}
      />
    </>
  )
}
