import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/app-error';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

import { RoleType } from '../config/roles';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw AppError.conflict('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role as RoleType });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role as RoleType });

    // Store Refresh Token in DB (7 days expiration)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    const sanitizedUser = await userRepository.sanitizeUser(user);

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role as RoleType });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role as RoleType });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.create(user.id, refreshToken, expiresAt);

    const sanitizedUser = await userRepository.sanitizeUser(user);

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    if (!token) {
      throw AppError.unauthorized('Refresh token is required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const storedToken = await refreshTokenRepository.findByToken(token);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await refreshTokenRepository.deleteByToken(token);
      }
      throw AppError.unauthorized('Refresh token is expired or revoked');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized('User no longer exists');
    }

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role as RoleType });
    return { accessToken: newAccessToken };
  }

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await refreshTokenRepository.deleteByToken(refreshToken);
    } else if (userId) {
      await refreshTokenRepository.deleteByUserId(userId);
    }
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User profile not found');
    }
    return userRepository.sanitizeUser(user);
  }

  async getAllUsers() {
    return userRepository.findAll();
  }
}

export const authService = new AuthService();
