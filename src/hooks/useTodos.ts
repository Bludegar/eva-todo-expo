import { useCallback, useEffect, useState, useContext } from 'react';
import * as todosService from '../services/todos';
import { Todo } from '../types';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// mapa compartido en el modulo para conservar imageUrl de creaciones recientes
const sharedPendingImageMap: Record<string, string> = {};
const STORAGE_PENDING_KEY = 'eva_pending_images';

export function useTodos() {
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todosService.listTodos();
      // fusionar imageUrl en memoria si existen para esos ids (evita perder miniaturas si el backend aun no las devuelve en list)
      const merged = data.map((t) => {
        if ((!t.imageUri || t.imageUri === null) && sharedPendingImageMap[t.id]) {
          return { ...t, imageUri: sharedPendingImageMap[t.id] } as Todo;
        }
        return t;
      });
      setItems(merged);
      (async () => {
        try {
          const missing = merged.filter((t) => !t.imageUri);
          for (const t of missing) {
            try {
              const fresh = await todosService.getTodoById(t.id);
              const imageUrl = fresh?.imageUrl || fresh?.photoUri || fresh?.photo || fresh?.url || fresh?.image || fresh?.data?.url;
              if (imageUrl) {
                // actualizar estado localmente
                setItems((prev) => prev.map((p) => (p.id === t.id ? { ...p, imageUri: imageUrl } : p)));
                // si teniamos una entrada pendiente para este id, borrarla y persistir el cambio
                if (sharedPendingImageMap[t.id]) {
                  delete sharedPendingImageMap[t.id];
                  try {
                    await AsyncStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(sharedPendingImageMap));
                  } catch (e) {
                    // ignore
                  }
                }
              }
            } catch (err) {
              // ignore individual failures
            }
          }
        } catch (err) {}
      })();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const auth = useContext(AuthContext);

  useEffect(() => {
    // esperar a que el contexto de auth termine de inicializar y haya token
    if (auth.initializing) return;
    if (!auth.token) return;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_PENDING_KEY);
        if (raw) {
          const parsed = JSON.parse(raw || '{}');
          Object.assign(sharedPendingImageMap, parsed);
        }
      } catch (e) {}
      load();
    })();
  }, [load, auth.initializing, auth.token]);

  const create = useCallback(async (payload: { title: string; imageUri?: string; location?: { latitude: number; longitude: number } }) => {
    setLoading(true);
    setError(null);
    try {
      const created = await todosService.createTodo(payload);
      // si el backend devolvio una URL de imagen, guardarla en el mapa temporal (compartido entre instancias del hook)
      if (created?.imageUri) {
        sharedPendingImageMap[created.id] = created.imageUri;
        try {
          await AsyncStorage.setItem(STORAGE_PENDING_KEY, JSON.stringify(sharedPendingImageMap));
        } catch (e) {}
      }
      setItems((s) => [created, ...s]);
      return created;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, body: Partial<Todo>) => {
    setLoading(true);
    setError(null);
    try {
      await todosService.updateTodo(id, body);
      setItems((s) => s.map((t) => (t.id === id ? { ...t, ...body } : t)));
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await todosService.deleteTodo(id);
      setItems((s) => s.filter((t) => t.id !== id));
      return res;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, loading, error, load, create, update, remove };
}

export default useTodos;
