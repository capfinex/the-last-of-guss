import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { prisma } from './database';
import { AuthenticatedUser } from '../types';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!;
  private readonly saltRounds = 10;

  async login(username: string, password: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return this.generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    }

    return null;
  }

  async register(username: string, password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    const role = this.determineUserRole(username);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    return this.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }

  async verifyToken(token: string): Promise<AuthenticatedUser | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as AuthenticatedUser;
      return payload;
    } catch {
      return null;
    }
  }

  private generateToken(user: AuthenticatedUser): string {
    return jwt.sign(user, this.jwtSecret, { expiresIn: '24h' });
  }

  private determineUserRole(username: string): UserRole {
    const lowercaseUsername = username.toLowerCase();
    
    if (lowercaseUsername === 'admin') {
      return UserRole.ADMIN;
    }
    
    if (lowercaseUsername === 'никита') {
      return UserRole.NIKITA;
    }
    
    return UserRole.SURVIVOR;
  }
}