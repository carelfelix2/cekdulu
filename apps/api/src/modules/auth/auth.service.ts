import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private get prisma() {
    return this.prismaService.client;
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private createTokens(user: { id: string; email: string; roles: string[] }) {
    const accessToken = this.jwtService.sign(
      { email: user.email, roles: user.roles },
      { secret: process.env.JWT_ACCESS_SECRET ?? 'change-me', expiresIn: process.env.JWT_ACCESS_TTL ?? '15m', subject: user.id },
    );

    const refreshToken = this.jwtService.sign(
      { email: user.email },
      { secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh', expiresIn: process.env.JWT_REFRESH_TTL ?? '30d', subject: user.id },
    );

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already used');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash
      },
      include: { roles: { include: { role: true } } }
    });

    const roleKeys = user.roles.map((item: { role: { key: string } }) => item.role.key);
    const tokens = this.createTokens({ id: user.id, email: user.email, roles: roleKeys });
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } }
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleKeys = user.roles.map((item: { role: { key: string } }) => item.role.key);
    const tokens = this.createTokens({ id: user.id, email: user.email, roles: roleKeys });
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh' }) as { sub: string; email: string };
      const tokenHash = this.hashRefreshToken(refreshToken);
      const token = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
      if (!token || token.revokedAt || token.expiresAt < new Date()) throw new UnauthorizedException('Invalid refresh token');

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: { include: { role: true } } }
      });

      if (!user) throw new UnauthorizedException('User not found');
      const roleKeys = user.roles.map((item: { role: { key: string } }) => item.role.key);
      const tokens = this.createTokens({ id: user.id, email: user.email, roles: roleKeys });
      await this.revokeRefreshToken(refreshToken);
      await this.persistRefreshToken(user.id, tokens.refreshToken);
      return { user: this.sanitizeUser(user), ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.revokeRefreshToken(refreshToken);
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });

    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: { id: string; email: string; name: string; status: string; roles: Array<{ role: { key: string } }> }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((item) => item.role.key)
    };
  }

  private async persistRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });
  }

  private async revokeRefreshToken(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
}
