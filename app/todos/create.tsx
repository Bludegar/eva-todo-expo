import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../_context/AuthContext';
import { Todo } from '../_types';
import { loadTodos, saveTodos } from '../_utils/storage';
import { useRouter } from 'expo-router';

// pantalla de crear tarea: titulo, foto, ubicacion
export default function CreateTodo() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<any>(null);
  const router = useRouter();

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return Alert.alert('permiso denegado');
    const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (r.cancelled) return;
    setImage(r.assets?.[0]?.uri || (r as any).uri);
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
      const dest = FileSystem.documentDirectory + filename;
      try {
        await FileSystem.copyAsync({ from: image, to: dest });
        savedUri = dest;
      } catch (e) {
        console.warn('error guardando imagen', e);
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
    <View style={styles.container}>
      <Text style={styles.title}>nueva tarea</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="titulo" style={styles.input} />
      <Button title="elegir foto" onPress={pickImage} />
      {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}
      <Button title="obtener ubicacion" onPress={takeLocation} />
      {location ? <Text>lat {location.latitude.toFixed(4)} lon {location.longitude.toFixed(4)}</Text> : null}
      <Button title="guardar" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 12, textTransform: 'lowercase' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 },
  preview: { width: 200, height: 200, marginVertical: 12 },
});
