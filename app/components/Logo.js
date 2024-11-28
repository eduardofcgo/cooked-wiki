import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Logo = () => {
  return (
    <View style={styles.logoWithHeadline}>
        <View style={styles.logoContainer}>
            <Text style={[styles.logo, styles.firstWordColor]}>Cook</Text>
            <Text style={[styles.logo, styles.lastWord]}>ed</Text>
        </View>
        <Text style={styles.logoHeadline}>Your smart cookbook</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoWithHeadline: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHeadline: {
    color: '#706b57',
    fontSize: 16,
    fontFamily: 'Times-New-Roman',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    color: '#706b57',
  },
  logo: {
    fontSize: 70,
    fontFamily: 'Times-New-Roman',
  },
  firstWordColor: {
    color: '#d97757',
  },
  lastWord: {
    color: '#706b57',
    letterSpacing: -5.5,
  }
});

export default Logo;