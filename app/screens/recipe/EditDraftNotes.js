import React, { useCallback } from 'react'
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { theme } from '../../style/style'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../context/StoreContext'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TransparentButton } from '../../components/core/Button'
import RecordCookCTA from '../../components/core/RecordCookCTA'
import { useInAppNotification } from '../../context/NotificationContext'
import ActionToast from '../../components/notification/ActionToast'

const normalizeNotes = notes => {
  return notes
    ?.replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/(^|\n)-\s*/g, '\n- ')
    .trim()
}

const EditDraftNotes = ({}) => {
  const navigation = useNavigation()
  const { showInAppNotification } = useInAppNotification()

  const route = useRoute()
  const { recipeId, extractId } = route.params

  const { recipeCookedDraftStore } = useStore()
  const draft = recipeCookedDraftStore.getDraft(recipeId || extractId)

  const handleSave = useCallback(() => {
    const normalizedNotes = normalizeNotes(draft.notes)
    draft.setNotes(normalizedNotes)

    navigation.goBack()
  }, [draft.notes, draft, navigation, showInAppNotification])

  const navigateToRecordCook = useCallback(() => {
    console.log('navigateToRecordCook', draft.notes)

    const normalizedNotes = normalizeNotes(draft.notes)
    draft.setNotes(normalizedNotes)

    navigation.replace('RecordCook', {
      recipeId,
      extractId,
      defaultNotes: draft?.notes,
    })
  }, [draft?.notes, draft, navigation, recipeId, extractId])

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.notesInput}
          multiline
          cursorColor={theme.colors.primary}
          placeholder='Your notes while cooking.'
          placeholderTextColor={theme.colors.softBlack}
          defaultValue={draft.notes}
          onChangeText={text => {
            draft.setNotes(text)
          }}
          autoFocus={true}
          keyboardType='default'
        />
        <View style={styles.buttonContainer}>
          <TransparentButton title='Save notes draft' onPress={handleSave} />
          <TouchableOpacity onPress={navigateToRecordCook}>
            <RecordCookCTA showIcon={false} showText={true} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  inputContainer: {},
  notesInput: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 16,
    textAlignVertical: 'top',
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.black,
  },
  buttonContainer: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default observer(EditDraftNotes)
