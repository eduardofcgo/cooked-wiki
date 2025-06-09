import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from './Button'
import ModalCard from './ModalCard'
import ActionToast from '../notification/ActionToast'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../context/StoreContext'
import { useInAppNotification } from '../../context/NotificationContext'

function BlockUser({ visible, onClose, username }) {
  const { showInAppNotification } = useInAppNotification()
  const { profileStore } = useStore()

  const onConfirmBlock = async () => {
    onClose()

    try {
      await profileStore.blockUser(username)

      showInAppNotification(ActionToast, {
        props: { message: `${username} has been blocked` },
      })
    } catch (error) {
      showInAppNotification(ActionToast, {
        props: { message: 'Failed to block user', success: false },
      })
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <ModalCard
      closeOnOverlay={false}
      visible={visible}
      onClose={handleCancel}
      disableContentUpdateAnimation={true}
      titleComponent={
        <View style={styles.titleContainer}>
          <Text style={styles.modalTitle}>Block User</Text>
        </View>
      }
    >
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          Are you sure you want to block <Text style={styles.usernameText}>{username}</Text>?
        </Text>
        <Text style={styles.subMessageText}>They won't be able to see your recipes or interact with your content.</Text>
      </View>

      <View style={styles.modalButtons}>
        <PrimaryButton title='Block User' onPress={onConfirmBlock} />
        <TransparentButton title='Cancel' onPress={handleCancel} />
      </View>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 30,
    gap: 10,
  },
  messageText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },
  usernameText: {
    fontFamily: theme.fonts.uiBold,
    fontSize: theme.fontSizes.default,
    fontWeight: 'bold',
  },
  subMessageText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    lineHeight: 18,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default observer(BlockUser)
