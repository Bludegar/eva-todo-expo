import api from './api';
import { Platform } from 'react-native';

// subir imagenes al endpoint /images
export async function uploadImageFromUri(uri: string) {
  // si es web, intentar enviar base64/data-uri via JSON
  if (Platform.OS === 'web') {
    try {
      const resp = await fetch(uri as any);
      const blob = await resp.blob();
      // enviar multipart/form-data con campo 'image' (segun OpenAPI)
      const form = new FormData();
      // FormData.append accepts (name, blob, filename) in browsers
      form.append('image', blob, 'photo.jpg');
      const res = await api.apiPostForm('/images', form as any);
      console.debug('images.uploadImageFromUri: upload response', res);
      return res;
    } catch (e) {
      console.warn('uploadImageFromUri web failed', e, (e as any)?.data || null);
      throw e;
    }
  }

  // en nativo, usar multipart/form-data al endpoint /images
  try {
    const form = new FormData();
    const name = (uri || '').split('/').pop() || `photo.jpg`;
    const type = 'image/jpeg';
    // usar el campo 'image' consistente con la especificacion OpenAPI
    // @ts-ignore
    form.append('image', { uri, name, type } as any);
    const res = await api.apiPostForm('/images', form as any);
    console.debug('images.uploadImageFromUri (native) response', res);
    return res;
  } catch (e) {
    console.warn('uploadImageFromUri native failed', e);
    throw e;
  }
}

export default { uploadImageFromUri };
