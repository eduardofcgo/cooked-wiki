import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTrophy, faMedal, faStar, faAward, faCrown, faFire, faLock } from '@fortawesome/free-solid-svg-icons'
import ModalCard from '../core/ModalCard'
import { theme } from '../../style/style'

const awards = [
  {
    id: 'master-chef',
    icon: faCrown,
    title: 'Master Chef',
    description: 'Cook 100 recipes',
    requirement: 100,
    color: '#FDB931', // Gold
  },
  {
    id: 'seasoned-cook',
    icon: faTrophy,
    title: 'Seasoned Cook',
    description: 'Cook 50 recipes',
    requirement: 50,
    color: '#C0C0C0', // Silver
  },
  {
    id: 'kitchen-enthusiast',
    icon: faMedal,
    title: 'Kitchen Enthusiast',
    description: 'Cook 25 recipes',
    requirement: 25,
    color: '#D08B48', // Bronze
  },
  {
    id: 'getting-started',
    icon: faStar,
    title: 'Getting Started',
    description: 'Cook your first 5 recipes',
    requirement: 5,
    color: theme.colors.primary,
  },
]

const AwardItem = ({ award, isAchieved }) => (
  <View style={[styles.awardItem, isAchieved && styles.achievedAwardItem]}>
    <View style={[styles.iconContainer, isAchieved ? styles.achievedIcon : styles.lockedIcon]}>
      <FontAwesomeIcon icon={award.icon} size={24} color={isAchieved ? award.color : theme.colors.softBlack} />
    </View>
    <View style={styles.awardInfo}>
      <Text style={[styles.awardTitle, !isAchieved && styles.lockedTitle]}>{award.title}</Text>
      <Text style={[styles.awardDescription, !isAchieved && styles.lockedDescription]}>{award.description}</Text>
    </View>
    {isAchieved ? (
      <View style={styles.achievedBadge}>
        <FontAwesomeIcon icon={faAward} size={16} color={theme.colors.primary} />
      </View>
    ) : (
      <FontAwesomeIcon icon={faLock} size={14} color={theme.colors.softBlack} />
    )}
  </View>
)

const CookingAwards = ({ visible, onClose, cookedCount }) => {
  return (
    <ModalCard
      visible={visible}
      onClose={onClose}
      titleComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Cooking awards</Text>
        </View>
      }
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.awardsContainer}>
          {awards.map(award => (
            <AwardItem key={award.id} award={award} isAchieved={cookedCount >= award.requirement} />
          ))}
        </View>
      </ScrollView>
    </ModalCard>
  )
}

const styles = StyleSheet.create({
  headerContainer: {},
  title: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
  },
  scrollView: {
    maxHeight: 400,
  },
  awardsContainer: {
    flex: 1,
    gap: 16,
  },
  awardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  achievedAwardItem: {
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievedIcon: {
    backgroundColor: theme.colors.secondary,
  },
  lockedIcon: {
    opacity: 0.1,
  },
  lockedTitle: {
    color: theme.colors.black,
  },
  lockedDescription: {
    color: theme.colors.softBlack,
  },
  progressText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.primary,
    marginTop: 4,
  },
  awardInfo: {
    flex: 1,
  },
  awardTitle: {
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.title,
    color: theme.colors.black,
    marginBottom: 4,
  },
  awardDescription: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.ui,
    color: theme.colors.softBlack,
  },
  achievedBadge: {
    marginLeft: 8,
  },
})

export default CookingAwards
