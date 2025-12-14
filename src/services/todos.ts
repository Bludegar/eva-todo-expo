import api from './api';
import { Todo } from '../types';
import { Platform } from 'react-native';

export async function listTodos(): Promise<Todo[]> {
  const data = await api.apiGet('/todos');
  // suponer que la API devuelve array de tareas
  return Array.isArray(data) ? data : data?.todos || [];
}

export async function createTodo(payload: { title: string; imageUri?: string; location?: { latitude: number; longitude: number } }) {
  const { title, imageUri, location } = payload;

  // intentar enviar multipart/form-data si hay imagen
  if (imageUri) {
    const form = new FormData();
    form.append('title', title);
    if (location) {
      form.append('latitude', String(location.latitude));
      form.append('longitude', String(location.longitude));
    }

    // en web necesitamos fetch->blob
    if (Platform.OS === 'web') {
      try {
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        form.append('image', blob, 'photo.jpg');
      } catch (e) {
        // fallback: enviar sin imagen
      }
    } else {
      // react-native: enviar objeto { uri, name, type }
      const name = imageUri.split('/').pop() || `photo.jpg`;
      const type = 'image/jpeg';
      // @ts-ignore
      form.append('image', { uri: imageUri, name, type });
    }

    return api.apiPostForm('/todos', form);
  }

  // sin imagen: enviar JSON
  return api.apiPost('/todos', { title, ...(location ? { location } : {}) });
}

export async function updateTodo(id: string, body: Partial<Todo>) {
  return api.apiPatch(`/todos/${id}`, body);
}

export async function deleteTodo(id: string) {
  return api.apiDelete(`/todos/${id}`);
}

export default {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
