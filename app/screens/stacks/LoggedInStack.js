import Contact from '../../screens/Contact'
import Cooked from '../../screens/Cooked'
import CookedLikes from '../../screens/CookedLikes'
import Extract from '../../screens/Extract'
import FindFriends from '../../screens/FindFriends'
import Followers from '../../screens/Followers'
import Following from '../../screens/Following'
import Main from '../../screens/Main'
import Notifications from '../../screens/Notifications'
import { PublicProfile } from '../../screens/Profile'
import RecipeSearch from '../../screens/RecipeSearch'
import RecordCook from '../../screens/RecordCook'
import RecordCookRecipe from '../../screens/RecordCookRecipe'
import Settings from '../../screens/Settings'
import Team from '../../screens/Team'
import Recipe from '../Recipe'

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
          presentation: 'modal',
          animation: 'slide_from_left',
        }}
      />

      <StackNavigator.Screen
        name='Extract'
        component={Extract}
        options={{
          title: 'Recipe',
          ...screenStyle,
          animation: 'none',
        }}
      />

      <StackNavigator.Screen
        name='RecordCookRecipe'
        component={RecordCookRecipe}
        options={{
          title: 'Cooked',
          ...screenStyle,
          animation: 'slide_from_right',
        }}
      />

      <StackNavigator.Screen name='Contact' component={Contact} options={{ title: 'Contact', ...screenStyle }} />

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

      <StackNavigator.Screen name='Team' component={Team} options={{ title: 'Patron', ...screenStyle }} />

      {/* <StackNavigator.Screen name='Cooked' component={Cooked} options={{ title: 'Cooked', ...screenStyle }} /> */}

      <StackNavigator.Screen
        name='RecordCook'
        component={RecordCook}
        options={{
          title: 'Add to journal',
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
        name='Cooked'
        component={Cooked}
        options={{
          ...screenStyle,
          animation: 'none',
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
        name='RecipeSearch'
        component={RecipeSearch}
        options={{
          title: 'Select recipe',
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </>
  )
}
