import React, { useContext, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from './_context/AuthContext';

// pantalla inicial: redirige a login si no hay usuario
export default function Index() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // retrasar la navegacion un poco para asegurar que el Root Layout
    // y su Slot esten montados; evita el error "Attempted to navigate before mounting"
    const id = setTimeout(() => {
      try {
        if (!user) {
          router.replace('/login');
        } else {
          router.replace('/(tabs)/home');
        }
      } catch (e) {
        // si falla, lo ignoramos brevemente; metro/dev lo mostrara en consola
        // no hacer nada aqui para no bloquear la app
      }
    }, 50);

    return () => clearTimeout(id);
  }, [user]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>cargando ...</Text>
    </View>
  );
}
