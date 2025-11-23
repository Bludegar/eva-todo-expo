import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import { BackgroundDecor, colors } from '../../src/theme';

export default function LogoutScreen() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        logout();
      } finally {
        router.replace('/login');
      }
    })();
  }, []);

  return (
    <View style={styles.wrapper}>
      <BackgroundDecor />
      <View style={styles.container}>
        <Text style={styles.text}>cerrando sesion...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.backgroundTop },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.softWhite, fontSize: 16 },
});
