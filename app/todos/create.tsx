import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import todosService from '../../src/services/todos';
import { AuthContext } from '../../src/context/AuthContext';
import { Todo } from '../../src/types';
import { BackgroundDecor, colors } from '../../src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

//crear tarea
export default function CreateTodo() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return Alert.alert('permiso denegado');
    // en web pedimos base64 para obtener un data uri estable
    const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: Platform.OS === 'web' });
    if ((r as any).canceled || (r as any).cancelled) return;

    // derivar la uri de forma segura: assets[0].uri, r.uri, o data url desde base64
    let pickedUri: string | undefined = undefined;
    if (r.assets && r.assets.length > 0) {
      const asset = r.assets[0] as any;
      if (asset.uri) pickedUri = asset.uri;
      else if (asset.base64) pickedUri = `data:image/jpeg;base64,${asset.base64}`;
    }
    const anyR = r as any;
    if (!pickedUri) {
      if (anyR.uri) pickedUri = anyR.uri;
      else if (anyR.base64) pickedUri = `data:image/jpeg;base64,${anyR.base64}`;
    }

    console.log('pickImage result:', { r, pickedUri });
    let finalUri = pickedUri;
    if (Platform.OS === 'web' && pickedUri && !pickedUri.startsWith('data:') && !pickedUri.startsWith('blob:')) {
      try {
        const resp = await fetch(pickedUri);
        const blob = await resp.blob();
        const obj = URL.createObjectURL(blob);
        finalUri = obj;
      } catch (e) {
      }
    }

    // en nativo intentar redimensionar y comprimir la imagen antes de guardarla/subir
    if (Platform.OS !== 'web' && finalUri) {
      try {
        const MAX_BYTES = 5 * 1024 * 1024; // 5MB
        const MAX_WIDTH = 1280;

        const resizeAndCompress = async (uri: string, quality: number) => {
          try {
            // intentar redimensionar al ancho maximo manteniendo aspect ratio
            const manip = await ImageManipulator.manipulateAsync(
              uri,
              [{ resize: { width: MAX_WIDTH } }],
              { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manip.uri;
          } catch (e) {
            return uri;
          }
        };

        // primeros intentos: redimensionar y comprimir en varios pasos
        let attemptUri = finalUri;
        attemptUri = await resizeAndCompress(attemptUri, 0.8);

        let info = await FileSystem.getInfoAsync(attemptUri).catch(() => ({ exists: false, size: 0 }));
        let quality = 0.7;
        let tries = 0;
        while (((info.size || 0) > MAX_BYTES) && tries < 4) {
          attemptUri = await resizeAndCompress(attemptUri, quality);
          info = await FileSystem.getInfoAsync(attemptUri).catch(() => ({ exists: false, size: 0 }));
          quality = Math.max(0.3, quality - 0.15);
          tries += 1;
        }

        // si aun es demasiado grande, avisar al usuario y no setear la imagen
        if ((info.size || 0) > MAX_BYTES) {
          Alert.alert('imagen muy grande', 'la imagen sigue siendo muy grande despues de comprimir. elige otra o recortala.');
          finalUri = undefined as any;
        } else {
          finalUri = attemptUri;
        }
      } catch (e) {
        console.warn('compress error', e);
      }
    }

    let savedUri = finalUri;
    if (Platform.OS !== 'web' && finalUri) {
      try {
        const normalizeUri = (u: string) => {
          if (!u) return u;
          if ((Platform.OS === 'ios' || Platform.OS === 'android') && u.startsWith('/')) return `file://${u}`;
          return u;
        };
        finalUri = normalizeUri(finalUri);
        const imagesDir = FileSystem.documentDirectory + 'images/';
        await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true }).catch(() => {});
        const ext = finalUri.split('.').pop()?.split('?')[0] || 'jpg';
        const name = `photo_${Date.now()}.${ext}`;
        const dest = imagesDir + name;

        await FileSystem.copyAsync({ from: finalUri, to: dest }).catch(async (err) => {
          try {
            await FileSystem.downloadAsync(finalUri, dest);
          } catch (e) {
            console.warn('no se pudo copiar imagen al filesystem, usando uri original', e);
          }
        });
        const info = await FileSystem.getInfoAsync(dest);
        if (info.exists) savedUri = dest;
      } catch (e) {
        console.warn('error guardando imagen en filesystem', e);
      }
    }

    setImage(savedUri);
  };

  const takeLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('permiso ubicacion denegado');
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const onSave = async () => {
    if (!user) return Alert.alert('no hay usuario');
    if (!title) return Alert.alert('ingresa un titulo');

    setSaving(true);
    try {
      // crear un todo temporal para mostrar la imagen de inmediato (optimista)
      const tempId = `local-${Date.now()}`;
      const tempTodo = { id: tempId, title, completed: false, location: location || null, imageUri: image } as any;
      try {
        const raw = await AsyncStorage.getItem('eva_local_todos');
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift(tempTodo);
        await AsyncStorage.setItem('eva_local_todos', JSON.stringify(arr));
        // tambien guardar en localStorage para web devtools
        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('eva_local_todos', JSON.stringify(arr));
          }
        } catch (e) {}
      } catch (e) {
        console.warn('no se pudo guardar temp todo', e);
      }

      // navegar inmediatamente para mostrar la lista con la imagen optimista
      router.replace('/todos');

      // crear en background y limpiar el temp cuando el servidor confirme
      (async () => {
        try {
          const created = await todosService.createTodo({ title, imageUri: image, location });
          try {
            // si el servidor no devolvio imageUri, guardar mapping especifico para aplicarlo
            if (created && !created.imageUri && image) {
              const mapping = { id: created.id, uri: image };
              await AsyncStorage.setItem('eva_last_image', JSON.stringify(mapping));
              try {
                if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem('eva_last_image', JSON.stringify(mapping));
                }
              } catch (e) {}
            }
          } catch (e) {}

          // eliminar temp de la lista local
          try {
            const raw2 = await AsyncStorage.getItem('eva_local_todos');
            const arr2 = raw2 ? JSON.parse(raw2) : [];
            const filtered = arr2.filter((t: any) => t.id !== tempId);
            await AsyncStorage.setItem('eva_local_todos', JSON.stringify(filtered));
            try {
              if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('eva_local_todos', JSON.stringify(filtered));
              }
            } catch (e) {}
          } catch (e) {}
        } catch (err) {
          console.warn('error creando tarea en background', err);
          // dejar el temp para reintento manual o indicar fallo al usuario
        }
      })();
    } catch (e) {
      console.warn('error creando tarea', e);
      Alert.alert('error', (e as any)?.message || 'no se pudo crear la tarea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <BackgroundDecor />
      <View style={styles.container}>
        <Text style={styles.title}>nueva tarea</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="titulo" placeholderTextColor="rgba(255,255,255,0.7)" style={styles.input} />

        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={18} color="#fff" style={styles.actionIcon} />
          <Text style={styles.actionText}>elegir foto</Text>
        </TouchableOpacity>
        {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}

        <TouchableOpacity style={styles.actionButton} onPress={takeLocation}>
          <Ionicons name="location-outline" size={18} color="#fff" style={styles.actionIcon} />
          <Text style={styles.actionText}>obtener ubicacion</Text>
        </TouchableOpacity>
        {location ? <Text style={styles.loc}>lat {location.latitude.toFixed(4)} lon {location.longitude.toFixed(4)}</Text> : null}

        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/')}>
            <Ionicons name="close-outline" size={18} color={colors.softWhite} style={styles.actionIcon} />
            <Text style={styles.cancelText}>cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
            <Ionicons name="checkmark" size={18} color="#111" style={styles.actionIcon} />
            <Text style={styles.primaryText}>guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.backgroundTop },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 12, color: colors.softWhite, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: colors.translucent, padding: 8, marginBottom: 12, borderRadius: 12, color: colors.softWhite, backgroundColor: 'rgba(255,255,255,0.02)' },
  preview: { width: 200, height: 200, marginVertical: 12, borderRadius: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.neonCyan, padding: 12, borderRadius: 999, marginBottom: 8, justifyContent: 'center' },
  actionIcon: { marginRight: 10 },
  actionText: { color: '#111', fontWeight: '700' },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.translucent, padding: 12, borderRadius: 999, marginRight: 8 },
  cancelText: { color: colors.softWhite, fontWeight: '700' },
  primaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neonCyan, padding: 12, borderRadius: 999 },
  primaryText: { color: '#111', fontWeight: '700' },
  loc: { color: 'rgba(248,249,251,0.9)' },
});
