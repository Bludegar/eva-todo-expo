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
