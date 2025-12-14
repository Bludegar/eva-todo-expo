import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname?.() ?? '';
  const insets = useSafeAreaInsets();

  // ocultar barra en la pantalla de login
  // ocultar barra en las pantallas publicas de autenticacion
  if (pathname.includes('login') || pathname.includes('register')) return null;

  const nav = (to: string) => () => router.push(to);

  const isActive = (segment: string) => pathname.includes(segment);

  const bg = theme?.colors?.softWhite ?? '#ffffff';
  const activeColor = theme?.colors?.primary ?? '#00f';

  const isIOS = Platform.OS === 'ios';
  const paddingBottom = (insets.bottom ?? 0) + (isIOS ? 4 : 6);
  const paddingTop = isIOS ? 4 : 6;
  const iconSize = isIOS ? 18 : 20;
  const labelSize = isIOS ? 8 : 9;
  const containerMinHeight = isIOS ? 40 : 48;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, paddingBottom, paddingTop },
      ]}
    >
      <TouchableOpacity style={styles.button} onPress={nav('/(tabs)/home')}>
        <Ionicons name={isActive('home') ? 'home' : 'home-outline'} size={iconSize} color={isActive('home') ? activeColor : '#000'} />
        <Text style={[styles.label, { color: isActive('home') ? activeColor : '#000', fontSize: labelSize }]}>home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={nav('/perfil')}>
        <Ionicons name={isActive('perfil') ? 'person' : 'person-outline'} size={iconSize} color={isActive('perfil') ? activeColor : '#000'} />
        <Text style={[styles.label, { color: isActive('perfil') ? activeColor : '#000', fontSize: labelSize }]}>perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={nav('/logout')}>
        <Ionicons name={'log-out-outline'} size={iconSize} color={'#000'} />
        <Text style={[styles.label, { fontSize: labelSize }]}>salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  label: {
    fontSize: 9,
    marginTop: 2,
  },
});
