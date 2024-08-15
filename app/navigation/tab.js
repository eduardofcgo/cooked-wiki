import { Text } from 'react-native'

export function tabProps({ name, component, emogi, title, options }) {
  return {
    name: name,
    component: component,
    options: {
      title: title,
      headerTitle: emogi ? `${emogi} ${title}` : title,
      headerStyle: {
        backgroundColor: '#efede3',
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        color: '#292521',
        fontFamily: 'Times-New-Roman',
      },
      tabBarIcon: () => <Text style={{ fontSize: 20 }}>{emogi}</Text>,
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
