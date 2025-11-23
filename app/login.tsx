import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from './_context/AuthContext';
import { useRouter } from 'expo-router';

// pantalla de login con email y password
// valida que la contraseña sea '1234' y muestra mensaje si es incorrecta
export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const onSubmit = async () => {
    if (!email || !password) return Alert.alert('ingresa email y password');
    if (password !== '1234') {
      // mensaje segun requerimiento
      return Alert.alert('Contraseña incorrecta');
    }
    await login(email);
    // al iniciar sesion correctamente, redirigir a tabs
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>iniciar sesion</Text>
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="entrar" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 18, marginBottom: 12, textTransform: 'lowercase' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 },
});
