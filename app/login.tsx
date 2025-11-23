import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { BackgroundDecor, colors } from '../src/theme';

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
    <View style={styles.wrapper}>
      <BackgroundDecor />
      <View style={styles.container}>
        <Text style={styles.title}>Procrastinot</Text>
        <Text style={styles.subtitle}>inicia con tu cuenta</Text>
        <TextInput
          placeholder="email"
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="password (1234) "
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={onSubmit} accessibilityLabel="entrar">
          <Text style={styles.btnText}>entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.backgroundTop },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: colors.softWhite, fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: 'rgba(248,249,251,0.8)', marginBottom: 18 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.translucent,
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    color: colors.softWhite,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  btn: {
    marginTop: 8,
    backgroundColor: colors.neonPink,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 24px rgba(255,110,199,0.18)' }
      : { shadowColor: colors.neonPink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 }),
  },
  btnText: { color: '#111', fontWeight: '700' },
});
