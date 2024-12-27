import React, { useState, useEffect } from 'react'

import { View, Text, StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTrophy } from '@fortawesome/free-solid-svg-icons/faTrophy'

import { useStore } from '../context/store/StoreContext'

import Loading from './Loading'

import { theme } from '../style/style'


const getTrophyColor = (cookedCount) => {
  if (cookedCount >= 100) return '#FDB931' // Warmer gold
  if (cookedCount >= 50) return '#C0C0C0' // Brighter silver
  if (cookedCount >= 5) return '#D08B48' // Richer bronze
  return '#D3D3D3' // Lighter gray
}

function ProfileStats({ username }) {
  const { profileStore } = useStore()
  const { profileStats, isLoadingProfileStats } = profileStore

  const trophyColor = getTrophyColor(profileStats?.['cooked-count'] || 0)

  useEffect(() => {
    (async () => {
      await profileStore.loadProfileStats(username)
    })()
  }, [])

  if (isLoadingProfileStats || !profileStats) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <View style={styles.numberContainer}>
          <FontAwesomeIcon icon={faTrophy} size={16} color={trophyColor} />
          <Text style={styles.number}>{profileStats['cooked-count']}</Text>
        </View>
        <Text style={styles.label}>Cooked</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.number}>{profileStats['followers-count']}</Text>
        <Text style={styles.label}>Followers</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.number}>{profileStats['following-count']}</Text>
        <Text style={styles.label}>Following</Text>
      </View>
    </View>
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