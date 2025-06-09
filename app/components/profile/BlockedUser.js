import React, { useCallback, useState } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { observer } from 'mobx-react-lite'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from '../core/Button'
import { useStore } from '../../context/StoreContext'
import ReportUserModal from '../core/ReportUserModal'

function BlockedUser({ style, username, onUnblocked }) {
  const { profileStore } = useStore()
  const [showReportModal, setShowReportModal] = useState(false)

  const unblocked = useCallback(async () => {
    await profileStore.unblockUser(username)

    if (onUnblocked) {
      onUnblocked()
    }
  }, [profileStore, username])

  const onReport = useCallback(async () => {
    setShowReportModal(true)
  }, [])

  const onCloseReportModal = useCallback(() => {
    setShowReportModal(false)
  }, [])

  return (
    <View
      style={{
        ...styles.container,
        ...style,
      }}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons name='account-cancel' size={22} color={theme.colors.softBlack} style={styles.icon} />
        <Text style={styles.message}>You have blocked this user.</Text>
        <Text style={styles.subMessage}>You won't see their posts, comments, or be able to interact with them.</Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            icon={<MaterialCommunityIcons name='flag' size={16} color={theme.colors.background} />}
            onPress={onReport}
            title='Report'
            style={styles.reportButton}
          />
          <TransparentButton
            icon={<MaterialCommunityIcons name='account-check' size={16} color={theme.colors.primary} />}
            onPress={unblocked}
            title='Unblock'
            style={styles.unblockButton}
          />
        </View>
      </View>

      <ReportUserModal
        visible={showReportModal}
        onClose={onCloseReportModal}
        username={username}
        suggestBlock={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontFamily: theme.fonts.ui,
    color: theme.colors.black,
    fontSize: theme.fontSizes.default,
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.softBlack,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  unblockButton: {
    flex: 1,
    maxWidth: 120,
  },
  reportButton: {
    flex: 1,
    maxWidth: 120,
  },
})

export default observer(BlockedUser)
