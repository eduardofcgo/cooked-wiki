import React, { useState, useEffect } from 'react'

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react-lite'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTrophy } from '@fortawesome/free-solid-svg-icons/faTrophy'
import { useNavigation } from '@react-navigation/native'

import { useStore } from '../context/store/StoreContext'

import Loading from './Loading'
import CookingAwards from './CookingAwards'

import { theme } from '../style/style'

const getTrophyColor = cookedCount => {
  if (cookedCount >= 100) return '#FDB931' // Warmer gold
  if (cookedCount >= 50) return '#C0C0C0' // Brighter silver
  if (cookedCount >= 5) return '#D08B48' // Richer bronze
  return '#D3D3D3' // Lighter gray
}

function ProfileStats({ username }) {
  const { profileStore } = useStore()
  const stats = profileStore.getProfileStats(username)
  const isLoading = profileStore.isLoadingProfileStats(username)
  const navigation = useNavigation()
  const [showAwards, setShowAwards] = useState(false)

  const trophyColor = getTrophyColor(stats?.['cooked-count'] || 0)

  useEffect(() => {
    profileStore.loadProfileStats(username)
  }, [])

  if (isLoading || !stats) {
    return <Loading />
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.statItem} onPress={() => setShowAwards(true)}>
          <View style={styles.numberContainer}>
            <FontAwesomeIcon icon={faTrophy} size={16} color={trophyColor} />
            <Text style={styles.number}>{stats['cooked-count']}</Text>
          </View>
          <Text style={styles.label}>Cooked</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Followers', { username })}>
          <Text style={styles.number}>{stats['followers-count']}</Text>
          <Text style={styles.label}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Following', { username })}>
          <Text style={styles.number}>{stats['following-count']}</Text>
          <Text style={styles.label}>Following</Text>
        </TouchableOpacity>
      </View>

      <CookingAwards visible={showAwards} onClose={() => setShowAwards(false)} cookedCount={stats['cooked-count']} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  number: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})

export default observer(ProfileStats)
