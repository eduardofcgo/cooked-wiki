import React from 'react'

import CookedRecipe from '../../screens/CookedRecipe'
import CookedLikes from '../../screens/CookedLikes'
import NewExtract from '../NewExtract'
import ShareIntentNewExtract from '../../screens/ShareIntentNewExtract'
import FindFriends from '../../screens/FindFriends'
import Followers from '../../screens/Followers'
import Following from '../../screens/Following'
import Main from '../../screens/Main'
import Notifications from '../../screens/Notifications'
import { PublicProfile } from '../../screens/Profile'
import RecipePicker from '../../screens/RecipePicker'
import RecordCook from '../../screens/RecordCook'
import FreestyleCook from '../../screens/FreestyleCook'
import EditCook from '../../screens/EditCook'
import Settings from '../../screens/Settings'
import Recipe from '../Recipe'
import EditDraftNotes from '../recipe/EditDraftNotes'
import RecipePrint from '../recipe/RecipePrint'

import { IconButton } from 'react-native-paper'

import { screenStyle, theme } from '../../style/style'

export default function LoggedInStack({ StackNavigator }) {
  return (
    <>
      <StackNavigator.Screen name='Main' options={{ headerShown: false }} component={Main} />

      <StackNavigator.Screen
        name='Notifications'
        component={Notifications}
        options={{
          title: 'Notifications',
          ...screenStyle,
          animation: 'slide_from_right',
        }}
      />

      <StackNavigator.Screen
        name='ShareIntentNewExtract'
        component={ShareIntentNewExtract}
        options={{
          title: 'New Recipe',
          ...screenStyle,
        }}
      />

      <StackNavigator.Screen
        name='Generate'
        component={NewExtract}
        options={{
          title: 'New Recipe',
          ...screenStyle,
        }}
      />

      <StackNavigator.Screen
        name='EditCook'
        component={EditCook}
        options={{
          title: 'Edit cook',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='Settings'
        component={Settings}
        options={{
          title: 'Settings',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='RecordCook'
        component={RecordCook}
        options={{
          title: 'Record cook',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='EditDraftNotes'
        component={EditDraftNotes}
        options={{
          title: 'Edit notes',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='Recipe'
        component={Recipe}
        options={({ navigation, route }) => ({
          title: 'Recipe',
          animation: 'slide_from_right',
          headerRight: () => (
            <IconButton
              icon='send'
              size={20}
              style={{ margin: 0, marginRight: -10 }}
              backgroundColor={theme.colors.secondary}
              color={theme.colors.black}
              onPress={() => {
                // const shareUrl = `http://192.168.1.96:3000/recipe`
                // Share.share({
                //     message: shareUrl,
                //     url: shareUrl,
                // })
              }}
            />
          ),
        })}
      />

      <StackNavigator.Screen
        name='CookedRecipe'
        component={CookedRecipe}
        options={{
          title: 'Recipe',
          ...screenStyle,
          // animation: 'none',
        }}
      />

      <StackNavigator.Screen
        name='FreestyleCook'
        component={FreestyleCook}
        options={{
          title: 'Cook',
          ...screenStyle,
          // animation: 'none',
        }}
      />

      <StackNavigator.Screen
        name='PublicProfile'
        component={PublicProfile}
        options={{ title: 'Profile', ...screenStyle }}
      />

      <StackNavigator.Screen
        name='FindFriends'
        component={FindFriends}
        options={{
          title: 'Find friends',
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        }}
      />

      <StackNavigator.Screen
        name='Following'
        component={Following}
        options={{
          title: 'Following',
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        }}
      />

      <StackNavigator.Screen
        name='Followers'
        component={Followers}
        options={{
          title: 'Followers',
          headerBackTitle: 'Back',
          animation: 'slide_from_right',
        }}
      />

      <StackNavigator.Screen
        name='CookedLikes'
        component={CookedLikes}
        options={{
          title: 'Likes',
          headerBackTitle: 'Back',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='RecipePicker'
        component={RecipePicker}
        options={{
          title: 'Select recipe',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='RecipePrint'
        component={RecipePrint}
        options={{
          title: 'Print Recipe',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </>
  )
}
