import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth';
import { LoginRequest } from '../types';
import { prisma } from '../services/database';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authService = new AuthService();

  fastify.post<{ Body: LoginRequest }>('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { username, password } = request.body;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      let token: string | null = null;

      if (existingUser) {
        // User exists, try to login
        token = await authService.login(username, password);
        
        if (!token) {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid password',
          });
        }
      } else {
        // User doesn't exist, create new user
        try {
          token = await authService.register(username, password);
        } catch (error: any) {
          if (error.code === 'P2002') { // Unique constraint violation
            return reply.status(400).send({
              statusCode: 400,
              error: 'Bad Request',
              message: 'Username already taken',
            });
          }
          throw error;
        }
      }

      // Set cookie and return success
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      return reply.send({
        success: true,
        message: 'Authentication successful',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Authentication failed',
      });
    }
  });

  fastify.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.send({
      success: true,
      message: 'Logged out successfully',
    });
  });
}