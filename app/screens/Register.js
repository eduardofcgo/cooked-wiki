import CookedWebView from '../components/CookedWebView'

export default function Extract({ navigation, route }) {
  return <CookedWebView startUrl={`http://192.168.1.96:3000/register`} navigation={navigation} route={route} />
}
