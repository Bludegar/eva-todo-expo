import React from 'react';
import { View, StyleSheet } from 'react-native';

export const colors = {
  backgroundTop: '#1b1f3a',
  backgroundBottom: '#7b2cbf',
  neonPink: '#ff6ec7',
  neonCyan: '#00f0ff',
  accent: '#ffd166',
  softWhite: '#f8f9fb',
  translucent: 'rgba(255,255,255,0.08)',
};

export function BackgroundDecor() {
  return (
    // evitar pasar pointerEvents como prop nativa; usar en style para compatibilidad web/native
    <View style={styles.container as any}>
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.gradient]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundTop,
    opacity: 0.95,
  },
  circle: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.18,
  },
  circle1: {
    width: 520,
    height: 520,
    right: -120,
    top: -180,
    backgroundColor: colors.neonPink,
  },
  circle2: {
    width: 420,
    height: 420,
    left: -140,
    bottom: -120,
    backgroundColor: colors.neonCyan,
  },
});

// placeholder por compatibilidad con expo-router
export default function _ThemePlaceholder() {
  return null;
}
