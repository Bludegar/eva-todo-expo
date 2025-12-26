import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { BackgroundDecor, colors } from '../src/theme';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/context/AuthContext';
import api from '../src/services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const onRegister = async () => {
    if (!email || !password) return Alert.alert('ingresa email y password');
    if (password !== confirm) return Alert.alert('las contraseñas no coinciden');
    setLoading(true);
    try {
      await api.registerRequest(email, password);
      // al registrarse, automaticamente hacer login
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      
      const status = e?.status;
      const data = e?.data;
      let serverMsg = 'no se pudo registrar';
      if (data) {
        if (typeof data === 'string') serverMsg = data;
        else if (data.message) serverMsg = data.message;
        else if (data.error) {
          // manejar error anidado (ej: { success:false, error: { name: 'ZodError', message: '[...]' } })
          if (typeof data.error === 'string') serverMsg = data.error;
          else if (data.error.message) {
            // a veces el backend devuelve un JSON string dentro de message
            const m = data.error.message;
            if (typeof m === 'string' && (m.trim().startsWith('[') || m.trim().startsWith('{'))) {
              try {
                const parsed = JSON.parse(m);
                if (Array.isArray(parsed)) serverMsg = parsed.join('\n');
                else serverMsg = JSON.stringify(parsed);
              } catch (err) {
                serverMsg = m;
              }
            } else {
              serverMsg = m;
            }
          } else {
            serverMsg = JSON.stringify(data.error);
          }
        }
        else if (data.errors) {
          try {
            if (typeof data.errors === 'string') serverMsg = data.errors;
            else if (Array.isArray(data.errors)) serverMsg = data.errors.join('\n');
            else if (typeof data.errors === 'object') {
              serverMsg = Object.entries(data.errors)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join('\n');
            }
          } catch (err) {
            serverMsg = JSON.stringify(data.errors);
          }
        } else {
          serverMsg = JSON.stringify(data);
        }
      } else {
        serverMsg = e?.message || serverMsg;
      }
      Alert.alert(status ? `error ${status}` : 'error', serverMsg || 'no se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <BackgroundDecor />

      <View style={styles.container}>
        <Text style={styles.title}>registrate</Text>
        <TextInput placeholder="email" placeholderTextColor="rgba(255,255,255,0.7)" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" autoComplete="off" textContentType="username" name="email" autoCorrect={false} spellCheck={false} data-lpignore="true" aria-autocomplete="none" />
        <TextInput placeholder="password" placeholderTextColor="rgba(255,255,255,0.7)" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry autoComplete="off" textContentType="newPassword" name="password" autoCorrect={false} spellCheck={false} data-lpignore="true" aria-autocomplete="none" />
        <TextInput placeholder="repite password" placeholderTextColor="rgba(255,255,255,0.7)" value={confirm} onChangeText={setConfirm} style={styles.input} secureTextEntry autoComplete="off" textContentType="newPassword" name="confirm_password" autoCorrect={false} spellCheck={false} data-lpignore="true" aria-autocomplete="none" />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={onRegister} disabled={loading} accessibilityLabel="crear-cuenta">
          {loading ? <ActivityIndicator color="#111" /> : <Text style={styles.btnText}>crear cuenta</Text>}
        </TouchableOpacity>
        
        

        <TouchableOpacity style={styles.link} onPress={() => router.replace('/login')}>
          <Text style={styles.linkText}>ya tengo cuenta, iniciar sesion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.backgroundTop, position: 'relative' },
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.softWhite, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { width: '100%', borderWidth: 1, borderColor: colors.translucent, padding: 12, marginBottom: 12, borderRadius: 12, color: colors.softWhite, backgroundColor: 'rgba(255,255,255,0.02)' },
  btn: { marginTop: 8, backgroundColor: colors.neonPink, paddingVertical: 12, paddingHorizontal: 36, borderRadius: 999, ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(255,110,199,0.18)' } : { shadowColor: colors.neonPink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 }) },
  btnText: { color: '#111', fontWeight: '700' },
  link: { marginTop: 12 },
  linkText: { color: colors.softWhite, textDecorationLine: 'underline' },
  
});
