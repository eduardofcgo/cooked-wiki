import React from 'react'
import { View, Image, StyleSheet, Dimensions, SafeAreaView } from 'react-native'
import CookedInput from '../../components/CookedInput'

export default function AddNotes({ route, navigation }) {
  const { imagePath } = route.params

  return (
    <View>
      <SafeAreaView>
        <CookedInput></CookedInput>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({})
