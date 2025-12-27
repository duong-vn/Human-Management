import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/schemas/user.schema';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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

  async login(user: any, res: Response) {
    const payload = {
      username: user.username,
      sub: user._id,
      role: user.role,
    };

    const refrest_token = this.jwtService.sign(
      {
        username: user.username,
        sub: user._id,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );
    res.cookie('refresh_token', refrest_token, {
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

      const verified = this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const payload = {
        username: verified.username,
        sub: verified.sub,
        role: verified.role,
      };

      const access_token = this.jwtService.sign(payload);
      return { access_token };
    } catch (e) {
      throw new BadRequestException('Refresh token sai hay sao y');
    }
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.CAN_BO,
    });

    const { password, ...result } = (user as any).toObject();
    return result;
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
