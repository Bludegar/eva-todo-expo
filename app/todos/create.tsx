import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../../src/context/AuthContext';
import { Todo } from '../../src/types';
import { loadTodos, saveTodos } from '../../src/utils/storage';
import { BackgroundDecor, colors } from '../../src/theme';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

//crear tarea
export default function CreateTodo() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<any>(null);
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
    // en web, algunas uris pueden ser rutas no accesibles 
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

    setImage(finalUri);
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

    // guardar imagen en filesystem si existe
    let savedUri: string | undefined = undefined;
    if (image) {
      const filename = `${uuidv4()}.jpg`;
      // algunos entornos (web) no exponen documentDirectory; usar fallback
      const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
      const dest = baseDir ? baseDir + filename : undefined;
      try {
        // en web evitamos copiar al filesystem local (no persistente)
        if (dest && Platform.OS !== 'web') {
          await FileSystem.copyAsync({ from: image, to: dest });
          savedUri = dest;
          const info = await (FileSystem as any).getInfoAsync(dest);
          console.log('imagen guardada en:', dest, info.exists);
        } else {
          // no hay directorio disponible o estamos en web: mantenemos la uri original (data: o blob: o http)
          savedUri = image;
          console.log('no documentDirectory disponible o web, usando uri original');
        }
      } catch (e) {
        console.warn('error guardando imagen, usando uri original', e);
        savedUri = image;
      }
    }

    const todos = await loadTodos(user.id);
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      imageUri: savedUri,
      location: location || undefined,
      completed: false,
      userId: user.id,
    };
    const updated = [newTodo, ...todos];
    await saveTodos(user.id, updated);
    router.replace('/todos');
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
