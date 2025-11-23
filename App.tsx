// polyfill necesario para que `uuid` funcione en react native / expo (crypto.getRandomValues)
import 'react-native-get-random-values';

// entry para expo-router
// este archivo solo importa el entrypoint del router
import 'expo-router/entry';

// comentarios: todas las demas pantallas se manejan en la carpeta `app`
