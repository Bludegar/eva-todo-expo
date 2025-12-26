import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Todo } from '../types';
import imagesService from './images';

function normalizeItem(raw: any): Todo {
  if (!raw) return raw;
  const id = raw.id ?? raw._id ?? String(raw.uuid || raw.key || '');
  const title = raw.title ?? raw.name ?? '';
  const completed = raw.completed ?? raw.done ?? false;
  const location = raw.location ?? (raw.latitude && raw.longitude ? { latitude: Number(raw.latitude), longitude: Number(raw.longitude) } : raw.coords ?? null) ?? null;
  const imageUri = raw.imageUri ?? raw.image ?? raw.imageUrl ?? raw.photoUri ?? raw.url ?? raw.photo ?? null;
  return { id, title, completed, location, imageUri } as Todo;
}

export async function listTodos(): Promise<Todo[]> {
  const data = await api.apiGet('/todos');
  const items = Array.isArray(data) ? data : data?.todos || data?.data || [];
  const normalized = items.map(normalizeItem);

  // nota: eliminados logs de diagnostico HEAD/GET de imagenes para producción
  return normalized;
}

export async function createTodo(payload: { title: string; imageUri?: string; location?: { latitude: number; longitude: number } }) {
  const { title, imageUri, location } = payload;
  // si hay imagen: primero subir via /images, luego crear el todo con la url que devuelva el backend
  if (imageUri) {
    try {
      const uploadRes: any = await imagesService.uploadImageFromUri(imageUri);
          console.log('todos.createTodo: uploadRes', uploadRes);
      // normalizar posible campo con la URL (imageUrl, url, data.url)
      const imageUrl = uploadRes?.url || uploadRes?.imageUrl || uploadRes?.data?.url || uploadRes?.data?.imageUrl || null;
      const payload: any = { title };
      if (location) payload.location = location;
      if (imageUrl) payload.imageUrl = imageUrl;
      // crear el todo apuntando a la URL devuelta por /images
          console.log('todos.createTodo: posting payload to /todos', payload);
      const createdRaw = await api.apiPost('/todos', payload);
      // extraer objeto real en caso de wrapper { success: true, data: { ... } }
      const createdObj = createdRaw && createdRaw.data ? createdRaw.data : createdRaw;
      // si el backend no devolvio la url de la imagen, inyectarla desde la respuesta de /images
      if (imageUrl && !(createdObj.imageUri || createdObj.imageUrl || createdObj.photoUri || createdObj.url)) {
        try {
          createdObj.imageUrl = imageUrl;
        } catch (err) {}
      }
      console.log('todos.createTodo: createdObj (normalized)', createdObj);
      // persistir en storage la url asociada a este todo para recuperarla si el backend no la incluye en GET /todos
      try {
        const KEY = 'eva_pending_images';
        const raw = await AsyncStorage.getItem(KEY);
        const map = raw ? JSON.parse(raw) : {};
        map[createdObj.id] = imageUrl;
        await AsyncStorage.setItem(KEY, JSON.stringify(map));
      } catch (e) {
        console.warn('todos.createTodo: failed to save pending image map', e);
      }
      return normalizeItem(createdObj);
    } catch (e) {
      console.warn('image upload or todo create failed', e);
      throw e;
    }
  }

  // sin imagen: enviar JSON
  const created = await api.apiPost('/todos', { title, ...(location ? { location } : {}) });
  return normalizeItem(created);
}

export async function updateTodo(id: string, body: Partial<Todo>) {
  console.debug('todos.updateTodo: request', { id, body });
  const res = await api.apiPatch(`/todos/${id}`, body);
  console.debug('todos.updateTodo: response', res);
  return res;
}

export async function getTodoById(id: string) {
  const res = await api.apiGet(`/todos/${id}`);
  const data = res && res.data ? res.data : res;
  console.log('todos.getTodoById: fetched', id, data?.imageUrl || data?.photoUri || data?.photo || data?.url || data?.image);
  return data;
}

export async function deleteTodo(id: string) {
  console.log('todos.deleteTodo: request', { id });
  const res = await api.apiDelete(`/todos/${id}`);
  console.log('todos.deleteTodo: response', res);
  return res;
}

export default {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};
