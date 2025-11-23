import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../src/theme';

// layout de tabs: iconos vectoriales en el footer
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        // color por defecto: negro; color activo: azul
        tabBarInactiveTintColor: '#000000',
        tabBarActiveTintColor: '#0a84ff',
      }}
    >
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size ?? 20} color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size ?? 20} color={color} /> }} />
      <Tabs.Screen name="logout" options={{ tabBarIcon: ({ color, size }) => <Ionicons name="log-out-outline" size={size ?? 20} color={color} /> }} />
    </Tabs>
  );
}
