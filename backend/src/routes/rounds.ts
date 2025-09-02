import { FastifyInstance } from 'fastify';
import { RoundService } from '../services/round';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { TapRequest } from '../types';

export async function roundRoutes(fastify: FastifyInstance): Promise<void> {
  const roundService = new RoundService();

  // Get all rounds
  fastify.get('/rounds', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      const rounds = await roundService.getRounds(request.user!.id);
      return reply.send(rounds);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to get rounds',
      });
    }
  });

  // Create new round (admin only)
  fastify.post('/rounds', {
    preHandler: [authenticateToken, requireAdmin],
  }, async (request, reply) => {
    try {
      const roundId = await roundService.createRound();
      return reply.status(201).send({ 
        success: true,
        roundId,
        message: 'Round created successfully' 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to create round',
      });
    }
  });

  // Get specific round
  fastify.get<{ Params: { id: string } }>('/rounds/:id', {
    preHandler: [authenticateToken],
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    try {
      const round = await roundService.getRound(request.params.id, request.user!.id);
      
      if (!round) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Round not found',
        });
      }

      return reply.send(round);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to get round',
      });
    }
  });

  // Tap the goose
  fastify.post<{ Body: TapRequest }>('/tap', {
    preHandler: [authenticateToken],
    schema: {
      body: {
        type: 'object',
        required: ['roundId'],
        properties: {
          roundId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { roundId } = request.body;
      const user = request.user!;

      const result = await roundService.tap(roundId, user.id, user.role);
      
      if (!result) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Round not found or not active',
        });
      }

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to register tap',
      });
    }
  });
}