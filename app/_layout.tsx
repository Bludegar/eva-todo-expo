import React from 'react';
import * as Router from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from '../src/context/AuthContext';
import FooterNav from '../src/components/FooterNav';
import theme from '../src/theme';
import { useRouter, usePathname } from 'expo-router';

// layout principal del router con provider de autenticacion
// intentamos renderizar Router.Slot si es un componente valido,
// si no, mostramos un fallback informativo para diagnostico
export default function Layout() {
  const SlotComp: any = (Router as any).Slot;
  const canRenderSlot = SlotComp && (typeof SlotComp === 'function' || typeof SlotComp === 'object');

  function Inner() {
    const { token, initializing } = React.useContext(AuthContext);
    const router = useRouter();
    const pathname = usePathname?.() ?? '';

    React.useEffect(() => {
      // solo redirigir despues de que AuthProvider termino de inicializar
      if (!initializing && !token && canRenderSlot) {
        // rutas publicas que no requieren token (permitir register y login)
        const publicPaths = ['/login', '/register', '/index', '/'];
        const isPublic = publicPaths.some(p => pathname.startsWith(p));
        if (!isPublic) {
          router.replace('/login');
        }
      }
    }, [initializing, token, pathname, canRenderSlot]);

    return (
      // si el slot esta disponible, renderizamos dentro de SafeAreaView
      canRenderSlot ? (
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
      )
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Inner />
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
