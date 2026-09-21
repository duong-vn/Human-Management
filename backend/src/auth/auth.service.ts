import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/schemas/user.schema';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface AuthUser {
  _id: unknown;
  username: string;
  role: UserRole;
  hoTen?: string;
  email?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getRefreshTokenSecret(): string {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    if (isProd && !secret) {
      throw new Error(
        'REFRESH_TOKEN_SECRET must be securely set in production environment',
      );
    }
    return secret || 'defaultRefreshSecret';
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (
      user &&
      (await this.usersService.validatePassword(password, user.password))
    ) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: AuthUser, res: Response) {
    const payload: JwtPayload = {
      username: user.username,
      sub: String(user._id),
      role: user.role,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: '7d',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return {
      access_token: this.jwtService.sign(payload),

      user: {
        id: user._id,
        username: user.username,
        hoTen: user.hoTen,
        email: user.email,
        role: user.role,
      },
    };
  }

  refresh(res: Response) {
    try {
      const refresh_token = res.req.cookies['refresh_token'];

      const verified = this.jwtService.verify<JwtPayload>(refresh_token, {
        secret: this.getRefreshTokenSecret(),
      });

      const payload: JwtPayload = {
        username: verified.username,
        sub: verified.sub,
        role: verified.role,
      };

      const access_token = this.jwtService.sign(payload);
      return { access_token };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.CAN_BO,
    });

    const userObj =
      typeof (user as any).toObject === 'function'
        ? (user as any).toObject()
        : user;
    const { password, ...result } = userObj;
    return result;
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
