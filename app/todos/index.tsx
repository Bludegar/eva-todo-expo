import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import { Todo } from '../../src/types';
import { BackgroundDecor, colors } from '../../src/theme';
import todosService from '../../src/services/todos';

// lista de tareas
export default function Todos() {
  const { user, logout } = useContext(AuthContext);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await todosService.listTodos();
      setTodos(data);
    } catch (e) {
      console.warn('error cargando todos', e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: string, current: boolean) => {
    try {
      await todosService.updateTodo(id, { completed: !current } as any);
      // optimista
      setTodos((s) => s.map((t) => (t.id === id ? { ...t, completed: !current } : t)));
    } catch (e) {
      console.warn('error actualizando todo', e);
      await load();
    }
  };

  const remove = async (id: string) => {
    try {
      await todosService.deleteTodo(id);
      setTodos((s) => s.filter((t) => t.id !== id));
    } catch (e) {
      console.warn('error eliminando todo', e);
      await load();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // saludo y lista de tareas
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? 'Buen Día' : hour < 18 ? 'Buenas Tardes' : 'Buenas Noches';

  return (
    <View style={styles.wrapper}>
      <BackgroundDecor />

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.username}>{user?.username}</Text>
      </View>

      <View style={styles.sep} />

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aun no tienes ninguna tarea añade una para comenzar</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/todos/create')}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(i) => i.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
          <View style={styles.itemRow}>
            {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.image} /> : <View style={styles.placeholder} />}
            <View style={styles.info}>
              <Text style={item.completed ? styles.done : styles.titleItem}>{item.title}</Text>
              {item.location ? (
                <Text style={styles.loc}>lat {item.location.latitude.toFixed(4)} lon {item.location.longitude.toFixed(4)}</Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggle(item.id, item.completed)} style={[styles.round, item.completed ? styles.roundDone : styles.roundPrimary]}>
                <Ionicons name={item.completed ? 'checkmark' : 'checkmark-outline'} size={18} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} style={[styles.round, styles.roundDanger]}>
                <Ionicons name="trash-outline" size={18} color="#111" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        />
      )}
      {todos.length > 0 && (
        <TouchableOpacity style={styles.addButtonFloating} onPress={() => router.push('/todos/create')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.backgroundTop },
  greetingContainer: { padding: 16 },
  greeting: { color: colors.softWhite, fontSize: 18, fontWeight: '700', textTransform: 'lowercase' },
  username: { color: 'rgba(248,249,251,0.9)', marginTop: 6, textTransform: 'lowercase' },
  sep: { height: 1, backgroundColor: colors.translucent },
  itemRow: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: colors.translucent },
  image: { width: 64, height: 64, marginRight: 12, borderRadius: 6 },
  placeholder: { width: 64, height: 64, marginRight: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)' },
  info: { flex: 1 },
  done: { textDecorationLine: 'line-through', color: '#888' },
  titleItem: { color: colors.softWhite, fontWeight: '600' },
  loc: { fontSize: 12, color: 'rgba(248,249,251,0.7)' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  roundPrimary: { backgroundColor: colors.neonCyan },
  roundDone: { backgroundColor: 'rgba(200,200,200,0.3)' },
  roundEdit: { backgroundColor: colors.accent },
  roundDanger: { backgroundColor: colors.neonPink },
  actionText: { fontWeight: '700', fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: colors.softWhite, textAlign: 'center', marginBottom: 18 },
  addButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#28a745', alignItems: 'center', justifyContent: 'center' },
  addButtonFloating: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
