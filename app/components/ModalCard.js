import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { theme } from '../style/style'

export default function ModalCard({ 
  visible, 
  onClose, 
  title,
  titleComponent,
  onShow,
  children 
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onShow={onShow}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalContainer} 
        activeOpacity={1} 
      >
        <TouchableOpacity 
          style={styles.modalContent} 
          activeOpacity={1} 
        >
          <View style={styles.modalHeader}>
            {titleComponent || (
              <Text style={styles.modalTitle}>{title}</Text>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesomeIcon icon={faXmark} size={15} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.disabledBackground,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopLeftRadius: theme.borderRadius.default,
    borderTopRightRadius: theme.borderRadius.default,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'left',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}) 