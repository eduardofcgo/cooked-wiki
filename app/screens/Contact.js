import CookedWebView from '../components/CookedWebView'

export default function Contact({ navigation, route }) {
  const onBeforeLoad = () => false

  return (
    <CookedWebView
      startUrl='https://cooked.wiki/contact'
      onBeforeLoad={onBeforeLoad}
      navigation={navigation}
      route={route}
    />
  )
}
