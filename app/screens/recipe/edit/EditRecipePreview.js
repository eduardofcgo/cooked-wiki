import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme, titleStyle } from '../../../style/style'

function EditRecipePreview() {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.menuBarContainer}>
        <View style={styles.menuBar}>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialCommunityIcons name='close' size={22} color={theme.colors.softBlack} />
          </TouchableOpacity>

          <Text style={styles.menuTitle}>Edit Recipe</Text>

          <TouchableOpacity style={styles.menuButton}>
            <MaterialCommunityIcons
              name='content-save'
              size={22}
              color={theme.colors.softBlack}
              opacity={theme.opacity.disabled}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.menuBarNavigateButton}>
          <MaterialCommunityIcons name='file-document-edit-outline' size={21} color={theme.colors.softBlack} />
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <Text>Edit Recipe Preview</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  menuBar: {
    flexGrow: 1,
    backgroundColor: theme.colors.secondary,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBarNavigateButton: {
    width: 64,
    flexGrow: 0,
    backgroundColor: theme.colors.secondary,
    marginVertical: 16,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBarContainer: {
    gap: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  menuButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  menuTitle: {
    ...titleStyle,
    textAlign: 'center',
    flex: 1,
  },
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
