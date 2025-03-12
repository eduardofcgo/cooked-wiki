import React from 'react'
import { View } from 'react-native'
import RecordCook from '../components/recordcook/RecordCook'
import FadeInStatusBar from '../components/FadeInStatusBar'
import { theme } from '../style/style'

export default function RecordCookScreen({ navigation, route }) {
  return (
    <>
      <RecordCook navigation={navigation} route={route} editMode={false} />
    </>
  )
}
