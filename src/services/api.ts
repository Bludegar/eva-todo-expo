// usa fetch y permite configurar token global
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const STORAGE_TOKEN_KEY = 'eva_token';

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

  // detectar formdata de manera robusta: en react-native FormData puede no ser instanceof FormData
  const body = (opts as any).body;
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData ? true : // navegadores
    body && typeof (body as any).append === 'function' ? true : // react-native FormData tiene append
    false;

  const init: RequestInit = {
    ...opts,
    headers: { ...(opts.headers || {}), ...headers(!isFormData) },
  };
  // asegurar que Authorization siempre venga desde authToken (evitar sobrescrituras)
  try {
    if (!init.headers) init.headers = {} as any;
    if (authToken) (init.headers as any)['Authorization'] = `Bearer ${authToken}`;
  } catch (err) {}
  // log diagnostico corto (no imprimir token completo)
  try {
    const tokenPreview = authToken ? `${String(authToken).slice(0, 6)}...${String(authToken).slice(-4)}` : null;
    // tambien loggear cabeceras basicas para diagnostico (sin token completo)
    const headerKeys = init.headers ? Object.keys(init.headers as any) : [];
    console.debug('api request', { url, method: init.method || 'GET', hasToken: !!authToken, tokenPreview, isFormData, headerKeys });
  } catch (err) {}
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (e) {
    data = text;
  }
  if (!res.ok) {
    // log util para diagnostico: mostrar url, status y body del error
    try {
      console.warn('api request error', { url, status: res.status, data });
    } catch (e) {}
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

// login de usuario
export async function loginRequest(email: string, password: string) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

// registro de usuario
export async function registerRequest(email: string, password: string) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
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
  registerRequest,
};
