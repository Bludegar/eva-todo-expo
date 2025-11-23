import React from 'react';
import { Tabs } from 'expo-router';

// layout de tabs: home y perfil
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'home' }} />
      <Tabs.Screen name="perfil" options={{ title: 'perfil' }} />
    </Tabs>
  );
}
