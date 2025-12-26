# eva-todo-expo

App ejemplo (Expo + React Native + TypeScript) — lista de tareas por usuario.

Resumen de funcionamiento
- login simple por email (la contrasena por defecto es `1234`).
- toda la data de tareas proviene del backend obligatorio (`EXPO_PUBLIC_API_URL`). no se persisten tareas localmente.
- cada tarea: titulo, foto (subida al backend y asociada a la tarea), ubicacion (opcional) y estado `completed`.
- las imagenes se manejan con `expo-image-picker`; en nativo se suben por `multipart/form-data` y en web se usa un fallback con base64/data-URI si es necesario.
- se usa `expo-location` para pedir la ubicacion cuando el usuario lo solicita.

Notas importantes
- la aplicacion requiere un backend (ver seccion "Backend obligatorio" y la variable `EXPO_PUBLIC_API_URL`).
- token de autenticacion se persiste en `AsyncStorage` (clave `eva_token`) y se usa para proteger rutas.
- toda la data de tareas se obtiene y modifica via el backend (no se guardan tareas localmente).
- en web la subida de imagenes puede usar un fallback con base64/data-URI para evitar problemas de CORS; en nativo se usa `multipart/form-data`.

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
- las tareas se obtienen siempre del backend configurado en `EXPO_PUBLIC_API_URL`.
- el token de autenticacion se guarda en `AsyncStorage` (clave `eva_token`).
- las fotos se guardan en el filesystem local en dispositivos nativos solo como temporal antes de subirlas; el backend devuelve la `imageUrl` que se usa para mostrar las miniaturas.

Notas tecnicas
- router: `expo-router` (file-based routing). Coloca utilidades fuera de la carpeta `app/` (por ejemplo en `src/`) para evitar que el router las trate como rutas.
- uploads: web usa fallback JSON/base64 para evitar problemas con multipart y CORS; native intenta multipart/form-data.
- ids: la app usa `uuid` en algunas versiones, por lo que es necesario el polyfill `react-native-get-random-values` en react-native/Expo para evitar el error `crypto.getRandomValues()`.
- safe-area: la aplicacion ya usa `react-native-safe-area-context` para respetar margenes en dispositivos con notch.

Server y opciones de despliegue
- el proyecto incluye (o incluyo en la conversacion) un ejemplo de servidor opcional para almacenar imagenes y devolver `imageUrl`. aplicar ese servidor hace que las imagenes sean visibles desde otros dispositivos.
- alternativa recomendada: presigned uploads (S3/GCS) — el backend solo emite URLs temporales y el cliente sube directamente, evitando problemas de limites y CORS.

Video
- Respuestas a las 4 preguntas (video): https://youtu.be/6zG5YhvaXS4

Asistencia
- parte del trabajo de depuracion y optimizacion del codigo se realizo con la asistencia de GitHub Copilot, usado como herramienta para verificar errores comunes, proponer parches y mejorar la calidad del codigo.

````


