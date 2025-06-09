import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import { theme } from '../../style/style'
import { PrimaryButton, TransparentButton } from '../core/Button'
import ModalCard from '../core/ModalCard'
import ActionToast from '../notification/ActionToast'
import { observer } from 'mobx-react-lite'
import { useInAppNotification } from '../../context/NotificationContext'
import { useApi } from '../../context/ApiContext'
import ReportSuccess from '../core/ReportSuccess'

function ReportCookedModal({ visible, onClose, cookedId, username }) {
  const { showInAppNotification } = useInAppNotification()
  const [reportReason, setReportReason] = React.useState('')
  const [reportedSuccessfully, setReportedSuccessfully] = useState(false)

  const client = useApi()

  const reportCooked = useCallback(async () => {
    await client.post(`/cooked/${cookedId}/report`, {
      message: reportReason,
    })
  }, [client, cookedId, reportReason])

  const onConfirmReport = async () => {
    try {
      await reportCooked()
      setReportedSuccessfully(true)
    } catch (error) {
      console.error(error)

      showInAppNotification(ActionToast, {
        props: { message: 'Failed to report content', success: false },
      })
    }
  }

  const handleCancel = () => {
    setReportReason('')
    setReportedSuccessfully(false)
    onClose()
  }

  return (
    <ModalCard
      closeOnOverlay={false}
      visible={visible}
      onClose={handleCancel}
      disableContentUpdateAnimation={true}
      titleComponent={
        reportedSuccessfully ? null : (
          <View style={styles.titleContainer}>
            <Text style={styles.modalTitle}>Report Content</Text>
          </View>
        )
      }
    >
      {reportedSuccessfully ? (
        <ReportSuccess username={username} onClose={handleCancel} />
      ) : (
        <>
          <View style={styles.messageContainer}>
            <Text style={styles.subMessageText}>
              This will notify our moderation team to review this content and its appropriateness.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Please explain why you're reporting this content (optional)"
              placeholderTextColor={theme.colors.gray}
              multiline={true}
              numberOfLines={4}
              textAlignVertical='top'
              maxLength={1000}
            />
          </View>

          <View style={styles.modalButtons}>
            <PrimaryButton title='Report' onPress={onConfirmReport} />
            <TransparentButton title='Cancel' onPress={handleCancel} />
          </View>
        </>
      )}
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
    marginBottom: 20,
    gap: 10,
  },
  messageText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },
  subMessageText: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
    gap: 8,
  },
  inputLabel: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.black,
    marginBottom: 5,
  },
  textInput: {
    borderRadius: theme.borderRadius.default,
    padding: 16,
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.default,
    color: theme.colors.black,
    backgroundColor: theme.colors.secondary,
    minHeight: 80,
  },
  characterCount: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.gray,
    textAlign: 'right',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default observer(ReportCookedModal)
