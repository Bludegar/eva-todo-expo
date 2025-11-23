// definicion de tipos usados en la app
export type User = {
  id: string;
  username: string;
};

export type Todo = {
  id: string;
  title: string;
  imageUri?: string; // path local
  location?: {
    latitude: number;
    longitude: number;
  };
  completed: boolean;
  userId: string;
};

// placeholder para que expo-router no marque error
export default function _TypesPlaceholder() {
  return null as any;
}
