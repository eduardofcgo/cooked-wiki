import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { List, Button } from 'react-native-paper';
import { theme } from '../style/style';
import { AuthContext } from '../context/auth';
import LoadingScreen from '../screens/Loading';

export default function Settings({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      setIsLoading(false);

      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            left={props => <List.Icon {...props} icon="account" />}
            onPress={() => navigation.navigate('PublicProfile')}
          />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {/* Handle notifications settings */}}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>App</List.Subheader>
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {/* Handle about */}}
          />
          <List.Item
            title="Help"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => navigation.navigate('Help')}
          />
        </List.Section>
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#706b57',
    backgroundColor: '#706b57',
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    opacity: 0.5,
  },
});
