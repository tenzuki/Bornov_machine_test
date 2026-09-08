export interface AuthUser {
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
