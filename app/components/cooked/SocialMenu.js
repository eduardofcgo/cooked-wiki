import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { theme } from '../../style/style'

const SocialMenu = ({ onActionPress, profileImage, username, date, showExpandIcon, showShareIcon }) => {
  return (
    <View style={styles.profileHeader}>
      <Image
        source={{ uri: profileImage || 'https://randomuser.me/api/portraits/women/43.jpg' }}
        style={styles.profilePicture}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.username}>{username || 'chefmaria'}</Text>
        <Text style={styles.name}>{date || '01/01/2025'}</Text>
      </View>
      <TouchableOpacity style={styles.expandButtonContainer} onPress={onActionPress}>
        <View style={styles.expandButtonWrapper}>
          {showExpandIcon && (
            <View style={styles.iconContainer}>
              <MaterialIcons name='keyboard-arrow-up' size={25} color={theme.colors.primary} />
            </View>
          )}
          {showShareIcon && (
            <View style={styles.iconContainer}>
              <MaterialIcons name='send' size={20} color={theme.colors.primary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: theme.colors.secondary,
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginBottom: 2,
  },
  name: {
    fontSize: 11,
    color: '#666',
  },
  expandButtonContainer: {
    padding: 8,
  },
  expandButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default SocialMenu
