import React, { useState } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { theme } from '../../style/style'
import { PrimaryButton, SecondaryButton } from '../Button'
import Modal from '../Modal'

const CommentModal = ({ visible, onClose, onSubmit, replyTo = null }) => {
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    onSubmit(comment, replyTo)
    setComment('')
  }

  return (
    <Modal visible={visible} onClose={onClose} title={replyTo ? `Reply to ${replyTo.authorName}` : 'Add Comment'}>
      <View style={[styles.editContainer, { height: 120 }]}>
        <TextInput
          multiline
          value={comment}
          onChangeText={setComment}
          style={styles.editInput}
          placeholder={replyTo ? `Reply to @${replyTo.authorName}...` : 'Write your comment...'}
        />
      </View>

      <View style={styles.actionsContainer}>
        <PrimaryButton onPress={handleSubmit} title='Post' />
        <SecondaryButton onPress={onClose} title='Cancel' />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  editContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    backgroundColor: theme.colors.secondary,
  },
  editInput: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
    borderWidth: 1,
    borderColor: theme.colors.softBlack,
    backgroundColor: theme.colors.background,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.secondary,
  },
})

export default CommentModal
