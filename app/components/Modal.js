import React from 'react';
import { View, Modal as RNModal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { theme } from '../style/style';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  animationType = "slide",
}) => {
  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesomeIcon
                icon={faXmark}
                size={15}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: theme.borderRadius.default,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
  },
  modalTitle: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
  },
  closeButton: {
    padding: 5,
  },
});

export default Modal; 