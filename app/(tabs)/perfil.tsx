import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { BackgroundDecor, colors } from '../../src/theme';
import { loadTodos } from '../../src/utils/storage';
import { Ionicons } from '@expo/vector-icons';

// perfil: mostrar nombre y contadores de tareas
export default function Perfil() {
  const { user } = useContext(AuthContext);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchCounts() {
      if (!user) {
        if (mounted) {
          setTotal(0);
          setCompleted(0);
        }
        return;
      }
      const todos = await loadTodos(user.id);
      if (!mounted) return;
      setTotal(todos.length);
      setCompleted(todos.filter((t) => t.completed).length);
    }
    fetchCounts();
    // actualizar cuando el usuario cambie
    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <View style={styles.wrapper}>
      <BackgroundDecor />
      <View style={styles.container}>
        <Text style={styles.title}>perfil</Text>
        <Text style={styles.name}>{user?.username ?? 'sin usuario'}</Text>

        <View style={styles.counters}>
          <View style={styles.card}>
            <Ionicons name="checkmark-done-outline" size={28} color={colors.neonCyan} />
            <Text style={styles.count}>{completed}</Text>
            <Text style={styles.label}>completadas</Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="list-outline" size={28} color={colors.neonPink} />
            <Text style={styles.count}>{total}</Text>
            <Text style={styles.label}>totales</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.backgroundTop },
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40, paddingHorizontal: 20 },
  title: { fontSize: 20, marginBottom: 6, color: colors.softWhite, fontWeight: '700' },
  name: { color: colors.softWhite, fontSize: 16, marginBottom: 18 },
  counters: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 12 },
  card: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, minWidth: 110 },
  count: { fontSize: 22, color: colors.softWhite, fontWeight: '700', marginTop: 6 },
  label: { fontSize: 12, color: 'rgba(248,249,251,0.8)', marginTop: 4, textTransform: 'uppercase' },
});
