import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { BaseContext } from '@apollo/server';
import { Context } from '@/types';
import { UserModel } from '@/models/user/user.model';

interface AuthPayload {
  id: string;
}

export const buildContext = async (req: Request): Promise<Context> => {
  const authHeader = req.headers.authorization;
  let user: Context['user'] = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      const dbUser = await UserModel.findById(payload.id).select('_id role');
      if (dbUser) {
        user = { id: dbUser.id.toString(), role: dbUser.role };
      }
    } catch {
      console.warn('Invalid token');
    }
  }

  return { user };
};