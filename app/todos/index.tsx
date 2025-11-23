import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthContext } from '../_context/AuthContext';
import { loadTodos, saveTodos } from '../_utils/storage';
import { Todo } from '../_types';

// pantalla de lista de tareas
export default function Todos() {
  const { user, logout } = useContext(AuthContext);
  const [todos, setTodos] = useState<Todo[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    loadTodos(user.id).then(setTodos);
  }, [user]);

  const persist = async (newTodos: Todo[]) => {
    if (!user) return;
    setTodos(newTodos);
    await saveTodos(user.id, newTodos);
  };

  const toggle = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    persist(updated);
  };

  const remove = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    persist(updated);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>mis tareas</Text>
        <View style={{ flexDirection: 'row' }}>
          <Button title="nuevo" onPress={() => router.push('/todos/create')} />
          <Button title="salir" onPress={() => logout()} />
        </View>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.image} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={item.completed ? styles.done : undefined}>{item.title}</Text>
              {item.location ? (
                <Text style={styles.loc}>lat: {item.location.latitude.toFixed(4)} lon: {item.location.longitude.toFixed(4)}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => toggle(item.id)} style={styles.btn}>
              <Text>{item.completed ? 'desmarcar' : 'completar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.btn}>
              <Text>eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, textTransform: 'lowercase' },
  item: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  image: { width: 64, height: 64, marginRight: 8, borderRadius: 6 },
  btn: { padding: 8 },
  done: { textDecorationLine: 'line-through', color: '#888' },
  loc: { fontSize: 12, color: '#666' },
});
