import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../_types';

// funciones para guardar/leer tareas por usuario

export const getTodosKey = (userId: string) => `todos_${userId}`;

export async function loadTodos(userId: string): Promise<Todo[]> {
  try {
    const key = getTodosKey(userId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as Todo[];
  } catch (e) {
    return [];
  }
}

export async function saveTodos(userId: string, todos: Todo[]) {
  const key = getTodosKey(userId);
  await AsyncStorage.setItem(key, JSON.stringify(todos));
}
