import React from 'react'

import CookedRecipe from '../../screens/CookedRecipe'
import CookedLikes from '../../screens/cooked/CookedLikes'
import NewExtract from '../NewExtract'
import ShareIntentNewExtract from '../../screens/ShareIntentNewExtract'
import FindFriends from '../../screens/FindFriends'
import Followers from '../../screens/Followers'
import Following from '../../screens/Following'
import Main from '../../screens/Main'
import Notifications from '../../screens/Notifications'
import { PublicProfile } from '../../screens/Profile'
import ProfileLimits from '../../screens/ProfileLimits'
import RecipePicker from '../../screens/RecipePicker'
import RecordCook from '../../screens/RecordCook'
import Cooked from '../../screens/cooked/Cooked'
import FreestyleCook from '../../screens/cooked/FreestyleCook'
import EditCook from '../../screens/cooked/EditCook'
import Settings from '../../screens/Settings'
import Recipe from '../Recipe'
import EditDraftNotes from '../recipe/EditDraftNotes'
import PrintPDF from '../PrintPDF'
import ShareCooked from '../../screens/cooked/share/ShareCooked'
import EditRecipePreview from '../../screens/recipe/edit/EditRecipePreview'
import EditRecipeText from '../../screens/recipe/edit/EditRecipeText'

import { screenStyle } from '../../style/style'

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
          headerShown: false,
        })}
      />

      <StackNavigator.Screen
        name='EditRecipePreview'
        component={EditRecipePreview}
        options={{
          title: 'Edit Recipe',
          animation: 'slide_from_bottom',
          headerShown: false,
        }}
      />

      <StackNavigator.Screen
        name='EditRecipeText'
        component={EditRecipeText}
        options={{
          title: 'Edit Recipe',
          animation: 'slide_from_bottom',
          headerShown: false,
        }}
      />

      <StackNavigator.Screen
        name='Cooked'
        component={Cooked}
        options={{
          title: 'Cooked',
          headerShown: false,
          ...screenStyle,
        }}
      />

      <StackNavigator.Screen
        name='CookedRecipe'
        component={CookedRecipe}
        options={{
          title: 'Recipe',
          headerShown: false,
          ...screenStyle,
        }}
      />

      <StackNavigator.Screen
        name='FreestyleCook'
        component={FreestyleCook}
        options={{
          title: 'Cooked',
          ...screenStyle,
        }}
      />

      <StackNavigator.Screen
        name='ShareCooked'
        component={ShareCooked}
        options={{
          title: 'Share Cooked',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
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
        name='PrintPDF'
        component={PrintPDF}
        options={{
          title: 'Print PDF',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <StackNavigator.Screen
        name='ProfileLimits'
        component={ProfileLimits}
        options={{
          title: 'Profile Limits',
          ...screenStyle,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </>
  )
}
