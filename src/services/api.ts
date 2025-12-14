// servicio basico para llamadas al backend
// usa fetch y permite configurar token global
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const STORAGE_TOKEN_KEY = 'eva_token';

// resolver la URL base en este orden:
// 1. process.env.EXPO_PUBLIC_API_URL (si usas variables de entorno en dev)
// 2. app.json/app.config.js -> expo.extra.EXPO_PUBLIC_API_URL (accesible via Constants.expoConfig)
// 3. fallback por defecto
const DEFAULT_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants?.expoConfig as any)?.extra?.EXPO_PUBLIC_API_URL ||
  'https://todo-list.dobleb.cl';

let apiBase = DEFAULT_BASE;
let authToken: string | null = null;

export function setBaseUrl(url: string) {
  apiBase = url;
}

export function getBaseUrl() {
  return apiBase;
}

export function setToken(token: string | null) {
  authToken = token;
}

function headers(isJson = true, extra?: HeadersInit) {
  const h: HeadersInit = { ...(extra || {}) };
  if (isJson) h['Content-Type'] = 'application/json';
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
}

async function request(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${apiBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const init: RequestInit = {
    ...opts,
    headers: { ...(opts.headers || {}), ...headers(!(opts.body instanceof FormData)) },
  };
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    const err: any = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiPost(path: string, body: any) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiGet(path: string) {
  return request(path, { method: 'GET' });
}

export async function apiPatch(path: string, body: any) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function apiDelete(path: string) {
  return request(path, { method: 'DELETE' });
}

export async function apiPostForm(path: string, form: FormData) {
  return request(path, { method: 'POST', body: form, headers: headers(false) });
}

// helpers para token persistente
export async function loadStoredToken() {
  try {
    const t = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
    if (t) {
      authToken = t;
      return t;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function saveStoredToken(token: string) {
  try {
    await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
    authToken = token;
  } catch (e) {
    // ignore
  }
}

export async function removeStoredToken() {
  try {
    await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    authToken = null;
  } catch (e) {
    // ignore
  }
}

// ejemplo de endpoint de login. Ajustar segun la API real.
export async function loginRequest(email: string, password: string) {
  // muchos backends usan /auth/login o /login. Ajusta si es necesario.
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export default {
  setBaseUrl,
  getBaseUrl,
  setToken,
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  apiPostForm,
  loadStoredToken,
  saveStoredToken,
  removeStoredToken,
  loginRequest,
};
