import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.refreshToken || req.cookies?.refreshToken;
    const result = await authService.refresh(token);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.refreshToken || req.cookies?.refreshToken;
    await authService.logout(token, req.user?.userId);

    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  });
}

export const authController = new AuthController();
