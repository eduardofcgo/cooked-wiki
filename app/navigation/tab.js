import { Text } from 'react-native'

export function tabProps({ name, component, emogi, title, options }) {
  return {
    name: name,
    component: component,
    options: {
      title: title,
      headerStyle: {
        backgroundColor: '#fafaf7',
      },
      headerTitleStyle: {
        color: '#292521',
      },
      tabBarIcon: () => <Text>{emogi}</Text>,
      ...(options || {}),
    },
    listeners: ({ navigation }) => ({
      tabPress: () => {
        if (navigation.isFocused()) {
          // TODO: get current focused and go there
          navigation.navigate('Main', { screen: name, params: { reset: true } })
        }
      },
    }),
  }
}
