export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];
