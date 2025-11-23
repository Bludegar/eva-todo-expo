# eva-todo-expo

App ejemplo (Expo + React Native + TypeScript) — lista de tareas por usuario.

Resumen de funcionamiento
- login simple por email (la contrasena por defecto es `1234`).
- cada usuario tiene su propia lista de tareas (persistidas en `AsyncStorage` bajo la clave `todos_<userId>`).
- cada tarea: titulo, foto (se guarda en filesystem cuando es posible), ubicacion (opcional) y estado `completed`.
- las imagenes se manejan con `expo-image-picker` y se persisten en `expo-file-system` en dispositivos nativos; en web se usan data/blob URLs.
- se usa `expo-location` para pedir la ubicacion cuando el usuario lo solicita.

Instalacion
1. clona el repo y entra en la carpeta del proyecto:

```bash
git clone <repo-url>
cd eva-todo-expo
```

2. instala dependencias (ejemplo con npm):

```bash
npm install
# instala el polyfill necesario para uuid en react-native
npm install react-native-get-random-values --save
```

3. inicia el bundler de Expo (limpia cache si hay problemas):

```bash
npx expo start -c
```

Uso rapido
- abre la app en Expo Go (iOS/Android) o en el navegador (`web`).
- en la pantalla de login ingresa un email y la contrasena `1234`.
- crea tareas desde `+` o desde la pantalla de crear: agrega titulo, opcion de foto y/o ubicacion.
- el footer de navegacion contiene `home`, `perfil` y `salir`.

Persistencia y datos
- las tareas se guardan por usuario en `AsyncStorage` con la clave `todos_<userId>`.
- las fotos se guardan en el filesystem local en dispositivos nativos; en web se mantienen como data/blob URLs.

Notas tecnicas
- router: `expo-router` (file-based routing). Coloca utilidades fuera de la carpeta `app/` (por ejemplo en `src/`) para evitar que el router las trate como rutas.
- ids: la app usa `uuid` en algunas versiones, por lo que es necesario el polyfill `react-native-get-random-values` en react-native/Expo para evitar el error `crypto.getRandomValues()`.
- safe-area: la aplicacion ya usa `react-native-safe-area-context` para respetar margenes en dispositivos con notch.

Video
- https://youtube.com/shorts/V2oRYaC0Jys?feature=share

Asistencia
- parte del trabajo de depuracion y optimizacion del codigo se realizo con la asistencia de GitHub Copilot, usado como herramienta para verificar errores comunes, proponer parches y mejorar la calidad del codigo.

````


