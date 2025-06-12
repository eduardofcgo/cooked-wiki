import React from 'react'
import { observer } from 'mobx-react-lite'
import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import EditPreviewRecipeMenu from '../../../components/recipe/menu/EditPreviewRecipeMenu'

// In the future the user will also be able to edit recipe in "preview mode"

function EditRecipePreview() {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView>
        <EditPreviewRecipeMenu />
      </SafeAreaView>

      <View style={styles.content}>
        <Text>Edit Recipe Preview</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 140,
    padding: 16,
  },
  container: {
    flex: 1,
  },
})

export default observer(EditRecipePreview)
