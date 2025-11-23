import React from 'react';
import * as Router from 'expo-router';
import { View, Text } from 'react-native';
import { AuthProvider } from './_context/AuthContext';

// layout principal del router con provider de autenticacion
// intentamos renderizar Router.Slot si es un componente valido,
// si no, mostramos un fallback informativo para diagnostico
export default function Layout() {
  const SlotComp: any = (Router as any).Slot;
  const canRenderSlot = SlotComp && (typeof SlotComp === 'function' || typeof SlotComp === 'object');

  return (
    <AuthProvider>
      {canRenderSlot ? (
        // si parece valido, renderizar
        <SlotComp />
      ) : (
        // fallback: mostrar mensaje para ayudar a diagnosticar
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>router slot no disponible - revisa import de expo-router</Text>
        </View>
      )}
    </AuthProvider>
  );
}
