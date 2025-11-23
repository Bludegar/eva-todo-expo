import React from 'react';
import * as Router from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import FooterNav from '../src/components/FooterNav';
import theme from '../src/theme';

// layout principal del router con provider de autenticacion
// intentamos renderizar Router.Slot si es un componente valido,
// si no, mostramos un fallback informativo para diagnostico
export default function Layout() {
  const SlotComp: any = (Router as any).Slot;
  const canRenderSlot = SlotComp && (typeof SlotComp === 'function' || typeof SlotComp === 'object');

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {canRenderSlot ? (
          // si parece valido, renderizar dentro de SafeAreaView
          <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1 }}>
              <SlotComp />
            </View>
            <FooterNav />
          </SafeAreaView>
        ) : (
          // fallback: mostrar mensaje para ayudar a diagnosticar
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>router slot no disponible - revisa import de expo-router</Text>
          </View>
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
