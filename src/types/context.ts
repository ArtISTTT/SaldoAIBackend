export interface Context {
  user: {
    id: string;
    role?: 'user' | 'admin';
  } | null;
}