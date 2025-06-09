import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from './Button'
import { observer } from 'mobx-react-lite'
import { useInAppNotification } from '../../context/NotificationContext'
import { useApi } from '../../context/ApiContext'
import ActionToast from '../notification/ActionToast'
import Bounce from './Bounce'

function ReportSuccess({ username, onClose }) {
  const { showInAppNotification } = useInAppNotification()
  const client = useApi()

  const blockUser = useCallback(async () => {
    await client.post(`/user/${username}/block`)
  }, [client, username])

  const onConfirmBlock = async () => {
    onClose()

    try {
      await blockUser()

      showInAppNotification(ActionToast, {
        props: { message: `${username} has been blocked` },
      })
    } catch (error) {
      console.error(error)

      showInAppNotification(ActionToast, {
        props: { message: 'Failed to block user', success: false },
      })
    }
  }

  const handleDone = () => {
    onClose()
  }

  return (
    <>
      <View style={styles.titleContainer}>
        <Bounce delay={300}>
          <FontAwesomeIcon icon={faCheck} size={24} color={theme.colors.primary} style={styles.checkIcon} />
        </Bounce>
        <Text style={styles.modalTitle}>Thank you</Text>
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Our moderation team will review this report.</Text>
        <Text style={styles.subMessageText}>
          Would you also like to block <Text style={styles.usernameText}>{username}</Text>? This will prevent them from
          interacting with you.
        </Text>
      </View>

      <View style={styles.modalButtons}>
        <PrimaryButton title='Block User' onPress={onConfirmBlock} />
        <TransparentButton title='Done' onPress={handleDone} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkIcon: {
    marginRight: 4,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 24,
    gap: 16,
  },
  messageText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    lineHeight: 22,
  },
  usernameText: {
    fontFamily: theme.fonts.uiBold,
    fontWeight: 'bold',
  },
  subMessageText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default observer(ReportSuccess)
