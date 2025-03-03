import { Tabs } from 'expo-router';
import React from 'react';
import { useWindowDimensions } from 'react-native';

export default function Layout() {
  const { width, height } = useWindowDimensions();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Hide the tab bar completely since we only have one tab
        tabBarStyle: {
          display: 'none'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: '/', // Make this the default route
        }}
      />
    </Tabs>
  );
}
