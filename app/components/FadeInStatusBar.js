import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../style/style';

export default function FadeInStatusBar({ color = theme.colors.primary }) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      StatusBar.setBackgroundColor(theme.colors.secondary, true);
      
      const timer = setTimeout(() => {
        StatusBar.setBackgroundColor(color, true);
      }, 100);

      return () => {
        clearTimeout(timer);
        StatusBar.setBackgroundColor(theme.colors.secondary, true);
      };
    }
  }, [isFocused, color]);

  return <StatusBar barStyle="dark-content" translucent />;
}   