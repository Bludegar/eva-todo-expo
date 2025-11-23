import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';

// pantalla home dentro de tabs
export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>bienvenido</Text>
      <Text>usuario: {user?.username}</Text>
      <Button title="ver tareas" onPress={() => router.push('/todos')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 8, textTransform: 'lowercase' },
});
