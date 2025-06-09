import { FontAwesome } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Menu, IconButton } from 'react-native-paper'
import { useStore } from '../../context/StoreContext'
import { theme } from '../../style/style'
import { MaterialIcons } from '@expo/vector-icons'
import { useInAppNotification } from '../../context/NotificationContext'
import ReportCookedModal from './ReportCookedModal'
import BlockUser from '../core/BlockUser'

const SocialMenu = observer(({ cookedId, onSharePress, onEditPress, username }) => {
  const navigation = useNavigation()
  const { profileStore } = useStore()
  const { showInAppNotification } = useInAppNotification()
  const [menuVisible, setMenuVisible] = useState(false)
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [blockUserVisible, setBlockUserVisible] = useState(false)

  const stats = profileStore.cookedStats.get(cookedId)
  const likeCount = stats?.['like-count']
  const liked = stats?.liked

  const likeCooked = useCallback(() => {
    profileStore.likeCooked(cookedId)
    // showInAppNotification(ActionToast, {
    //   props: { message: 'You liked a Cooked', actionType: 'like' },
    //   resetQueue: true,
    // })
  }, [cookedId, profileStore, showInAppNotification])

  const unlikeCooked = useCallback(() => {
    profileStore.unlikeCooked(cookedId)
  }, [cookedId, profileStore, showInAppNotification])

  const onPressLikeCount = useCallback(() => {
    navigation.navigate('CookedLikes', { cookedId })
  }, [cookedId, navigation])

  useEffect(() => {
    profileStore.loadCookedStats(cookedId)
  }, [cookedId, profileStore])

  return (
    <>
      <View style={styles.iconWrapper}>
        {stats ? (
          <View style={styles.heartContainer}>
            {likeCount > 0 && (
              <TouchableOpacity onPress={onPressLikeCount} hitSlop={{ top: 10, bottom: 10, left: 20, right: 10 }}>
                <Text allowFontScaling={false} style={styles.likeCounter}>
                  {likeCount}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={liked ? unlikeCooked : likeCooked} style={styles.iconContainer}>
              {liked ? (
                <FontAwesome name='heart' size={18} color={theme.colors.pink} />
              ) : (
                <FontAwesome name='heart' size={18} color={`${theme.colors.primary}80`} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator size='small' color={theme.colors.primary} />
        )}

        <TouchableOpacity onPress={onSharePress} style={styles.iconContainer}>
          <FontAwesome name='paper-plane' size={18} color={`${theme.colors.primary}80`} />
        </TouchableOpacity>

        {onEditPress ? (
          <TouchableOpacity style={styles.iconContainer} onPress={onEditPress}>
            <MaterialIcons name='edit' size={18} color={`${theme.colors.primary}80`} />
          </TouchableOpacity>
        ) : (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setMenuVisible(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name='more-vert' size={18} color={`${theme.colors.primary}80`} />
              </TouchableOpacity>
            }
            anchorPosition='bottom'
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false)
                setReportModalVisible(true)
              }}
              title='Report'
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false)
                setBlockUserVisible(true)
              }}
              title='Block user'
            />
          </Menu>
        )}
      </View>

      <ReportCookedModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        cookedId={cookedId}
        username={username}
      />

      <BlockUser visible={blockUserVisible} onClose={() => setBlockUserVisible(false)} username={username} />
    </>
  )
})

const styles = StyleSheet.create({
  iconWrapper: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    alignItems: 'center',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
})

export default SocialMenu
