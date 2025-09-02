import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth';

const authService = new AuthService();

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = request.cookies.token || 
      (request.headers.authorization?.startsWith('Bearer ') 
        ? request.headers.authorization.slice(7)
        : null);

    if (!token) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token not provided',
      });
    }

    const user = await authService.verifyToken(token);
    
    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    request.user = user;
  } catch (error) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user || request.user.role !== 'ADMIN') {
    return reply.status(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
}