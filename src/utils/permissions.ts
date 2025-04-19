import { Context } from '../types/context';

export const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new Error('Unauthorized');
  }
};

export const requireAdmin = (context: Context) => {
  requireAuth(context);

  if (context.user?.role !== 'admin') {
    throw new Error('Access denied: admin only');
  }
};
