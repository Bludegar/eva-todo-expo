import api from './api';
import { Todo } from '../types';
import { Platform } from 'react-native';

function normalizeItem(raw: any): Todo {
  if (!raw) return raw;
  const id = raw.id ?? raw._id ?? String(raw.uuid || raw.key || '');
  const title = raw.title ?? raw.name ?? '';
  const completed = raw.completed ?? raw.done ?? false;
  const location = raw.location ?? (raw.latitude && raw.longitude ? { latitude: Number(raw.latitude), longitude: Number(raw.longitude) } : raw.coords ?? null) ?? null;
  const imageUri = raw.imageUri ?? raw.image ?? raw.imageUrl ?? raw.url ?? raw.photo ?? null;
  return { id, title, completed, location, imageUri } as Todo;
}

export async function listTodos(): Promise<Todo[]> {
  const data = await api.apiGet('/todos');
  const items = Array.isArray(data) ? data : data?.todos || data?.data || [];
  return items.map(normalizeItem);
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

    // en web preferimos enviar JSON con la imagen en base64 (evita problemas CORS/proxy)
    if (Platform.OS === 'web') {
      try {
        let b64: string | null = null;
        if (typeof imageUri === 'string' && imageUri.startsWith('data:') && imageUri.includes('base64,')) {
          b64 = imageUri;
        } else {
          const resp = await fetch(imageUri as any);
          const blob = await resp.blob();
          const arrayBuffer = await blob.arrayBuffer();
          let binary = '';
          const bytes = new Uint8Array(arrayBuffer);
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
          }
          b64 = 'data:' + (blob.type || 'image/jpeg') + ';base64,' + btoa(binary);
        }

        if (b64) {
          const payload: any = { title };
          if (location) payload.location = location;
          payload.image = b64;
          const createdJson = await api.apiPost('/todos', payload);
          return normalizeItem(createdJson);
        }
      } catch (e) {
        console.warn('web json/base64 upload failed', e);
      }
    } else {
      // react-native: enviar objeto { uri, name, type }
      const name = imageUri.split('/').pop() || `photo.jpg`;
      const type = 'image/jpeg';
      // @ts-ignore
      const fileField: any = { uri: imageUri, name, type };
      // adjuntar solo con la clave 'file'
      // @ts-ignore
      form.append('file', fileField);
      // log de diagnostico (temporal)
      try {
        console.log('formdata prepared with fields: title, latitude?, longitude?, file');
      } catch (e) {}
    }

    // log adicional: intentar obtener tamano de la imagen a subir (solo RN)
    try {
      if (Platform.OS !== 'web') {
        // fileField.uri es la ruta que pasamos
        const uri = imageUri as string;
        // importar FileSystem dinamicamente para no romper en entornos donde no existe
        const { getInfoAsync } = await import('expo-file-system/legacy');
        const info = await getInfoAsync(uri).catch(() => ({ exists: false, size: 0 }));
        console.log('image upload info:', { uri, size: info.size, exists: info.exists });
      } else {
        try {
          const resp = await fetch(imageUri as any);
          const blob = await resp.blob();
          console.log('image upload info (web):', { size: blob.size, type: blob.type });
        } catch (e) {}
      }
    } catch (e) {
      console.warn('could not log image info', e);
    }

    try {
      const created = await api.apiPostForm('/todos', form);
      return normalizeItem(created);
    } catch (err: any) {
      // si el servidor rechaza multipart (400 invalid body), intentar enviar JSON con imagen en base64
      try {
        const status = err?.status;
        const data = err?.data;
        console.warn('multipart failed, attempting json fallback', { status, data });
        // construir payload con base64
        let b64: string | null = null;
        if (Platform.OS === 'web') {
          try {
            const resp = await fetch(imageUri as any);
            const blob = await resp.blob();
            const arrayBuffer = await blob.arrayBuffer();
            let binary = '';
            const bytes = new Uint8Array(arrayBuffer);
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.subarray(i, i + chunkSize);
              binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
            }
            b64 = 'data:' + (blob.type || 'image/jpeg') + ';base64,' + btoa(binary);
          } catch (e) {
            console.warn('fallback web base64 failed', e);
          }
        } else {
          try {
            const FS = await import('expo-file-system/legacy');
            b64 = await FS.readAsStringAsync(imageUri as string, { encoding: 'base64' });
            b64 = 'data:image/jpeg;base64,' + b64;
          } catch (e) {
            console.warn('fallback native base64 failed', e);
          }
        }

        if (b64) {
          const payload: any = { title };
          if (location) payload.location = location;
          payload.image = b64;
          const createdJson = await api.apiPost('/todos', payload);
          return normalizeItem(createdJson);
        }
      } catch (e) {
        console.warn('json fallback failed', e);
      }

      throw err;
    }
  }

  // sin imagen: enviar JSON
  const created = await api.apiPost('/todos', { title, ...(location ? { location } : {}) });
  return normalizeItem(created);
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
