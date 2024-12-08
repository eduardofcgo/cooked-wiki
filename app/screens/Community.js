import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { theme } from '../style/style'
import CookedWebView from '../components/CookedWebView'
import { getCommunityJournalUrl } from '../urls'

export default function Community({ navigation, route }) {
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{marginRight: 16}}
          hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
          onPress={handleAddFriends}
        >
          <Icon name="account-multiple" size={20} color={theme.colors.softBlack} />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const handleAddFriends = () => {
    navigation.navigate('FindFriends');
  };

  const handleEnableNotifications = () => {
    // TODO: Implement notifications permission request
  }

  return (
    <View style={styles.container}>

      <View style={styles.cardsContainer}>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon name="bell-outline" size={20} color={theme.colors.softBlack} />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.description}>
                Get notified when your friends cook something new.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleEnableNotifications}
            >
              <Text style={styles.buttonText}>Turn on</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon name="account-multiple" size={20} color={theme.colors.softBlack} />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.description}>
                Connect with your friends to see what they're cooking.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddFriends}
            >
              <Text style={styles.buttonText}>Add friends</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <CookedWebView
        startUrl={getCommunityJournalUrl()}
        navigation={navigation}
        route={route}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  cardsContainer: {
    gap: 16,
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#706b57',
    marginBottom: 8,
  },
  description: {
    fontFamily: theme.fonts.ui,
    fontSize: theme.fontSizes.small,
    color: theme.colors.black,
    marginBottom: 0,
  },
  button: {
    backgroundColor: theme.colors.softBlack,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: theme.fontSizes.small,
    fontWeight: '500',
    width: 60,
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFriendsButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addFriendsButtonText: {
    color: 'white',
    fontSize: theme.fontSizes.default,
    fontWeight: 'bold',
    fontFamily: theme.fonts.ui,
  },
})
