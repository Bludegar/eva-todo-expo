import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { BackgroundDecor, colors } from '../src/theme';

// login contra backend: usa AuthContext.login(email,password)
export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    if (!email || !password) return Alert.alert('ingresa email y password');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      
      Alert.alert('error', e?.data?.message || e?.message || 'credenciales invalidas');
    } finally {
      setLoading(false);
    }
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
          autoComplete="off"
          textContentType="username"
          name="email"
          autoCorrect={false}
          spellCheck={false}
          data-lpignore="true"
          aria-autocomplete="none"
        />
        <TextInput
          placeholder="password"
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          autoComplete="off"
          textContentType="password"
          name="password"
          autoCorrect={false}
          spellCheck={false}
          data-lpignore="true"
          aria-autocomplete="none"
        />

        <TouchableOpacity style={styles.btn} onPress={onSubmit} accessibilityLabel="entrar" disabled={loading}>
          {loading ? <ActivityIndicator color="#111" /> : <Text style={styles.btnText}>entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>¿No tienes cuenta? registrate</Text>
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
  link: { marginTop: 12 },
  linkText: { color: colors.softWhite, textDecorationLine: 'underline' },
});
