import { RoundStatus, UserRole } from '@prisma/client';
import { prisma } from './database';
import { RoundResponse, TapResponse } from '../types';

export class RoundService {
  private readonly roundDuration = parseInt(process.env.ROUND_DURATION!) * 60 * 1000; // minutes to ms
  private readonly cooldownDuration = parseInt(process.env.COOLDOWN_DURATION!) * 1000; // seconds to ms

  async createRound(): Promise<string> {
    const now = new Date();
    const startTime = new Date(now.getTime() + this.cooldownDuration);
    const endTime = new Date(startTime.getTime() + this.roundDuration);

    const round = await prisma.round.create({
      data: {
        startTime,
        endTime,
        status: RoundStatus.COOLDOWN,
      },
    });

    return round.id;
  }

  async getRounds(userId?: string): Promise<RoundResponse[]> {
    const rounds = await prisma.round.findMany({
      include: {
        roundResults: userId ? {
          where: { userId },
        } : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rounds.map(round => ({
      id: round.id,
      startTime: round.startTime,
      endTime: round.endTime,
      status: this.calculateRoundStatus(round.startTime, round.endTime),
      totalScore: round.totalScore,
      winnerId: round.winnerId || undefined,
      winnerName: round.winnerName || undefined,
      winnerScore: round.winnerScore || undefined,
      myScore: userId && Array.isArray(round.roundResults) ? round.roundResults[0]?.score : undefined,
      myTaps: userId && Array.isArray(round.roundResults) ? round.roundResults[0]?.taps : undefined,
    }));
  }

  async getRound(roundId: string, userId?: string): Promise<RoundResponse | null> {
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        roundResults: userId ? {
          where: { userId },
        } : false,
      },
    });

    if (!round) return null;

    return {
      id: round.id,
      startTime: round.startTime,
      endTime: round.endTime,
      status: this.calculateRoundStatus(round.startTime, round.endTime),
      totalScore: round.totalScore,
      winnerId: round.winnerId || undefined,
      winnerName: round.winnerName || undefined,
      winnerScore: round.winnerScore || undefined,
      myScore: userId && Array.isArray(round.roundResults) ? round.roundResults[0]?.score : undefined,
      myTaps: userId && Array.isArray(round.roundResults) ? round.roundResults[0]?.taps : undefined,
    };
  }

  async tap(roundId: string, userId: string, userRole: UserRole): Promise<TapResponse | null> {
    // Transaction to ensure consistency
    return await prisma.$transaction(async (tx) => {
      // Check if round is active
      const round = await tx.round.findUnique({
        where: { id: roundId },
      });

      if (!round) return null;

      const now = new Date();
      const isActive = now >= round.startTime && now <= round.endTime;
      
      if (!isActive) return null;

      // Get or create round result
      let roundResult = await tx.roundResult.findUnique({
        where: {
          userId_roundId: {
            userId,
            roundId,
          },
        },
      });

      if (!roundResult) {
        roundResult = await tx.roundResult.create({
          data: {
            userId,
            roundId,
            taps: 0,
            score: 0,
          },
        });
      }

      // Calculate new values
      const newTaps = roundResult.taps + 1;
      let newScore = roundResult.score;

      // Don't count score for Nikita users
      if (userRole !== UserRole.NIKITA) {
        // Every 11th tap gives 10 points, others give 1 point
        const scoreIncrease = newTaps % 11 === 0 ? 10 : 1;
        newScore += scoreIncrease;
      }

      // Update round result
      const updatedRoundResult = await tx.roundResult.update({
        where: { id: roundResult.id },
        data: {
          taps: newTaps,
          score: newScore,
        },
      });

      // Update round total score (only if not Nikita)
      if (userRole !== UserRole.NIKITA) {
        const scoreIncrease = newTaps % 11 === 0 ? 10 : 1;
        await tx.round.update({
          where: { id: roundId },
          data: {
            totalScore: {
              increment: scoreIncrease,
            },
          },
        });
      }

      return {
        myScore: updatedRoundResult.score,
        myTaps: updatedRoundResult.taps,
      };
    });
  }

  async updateRoundStatuses(): Promise<void> {
    const now = new Date();

    // Update finished rounds
    const finishedRounds = await prisma.round.findMany({
      where: {
        endTime: { lt: now },
        status: { not: RoundStatus.FINISHED },
      },
      include: {
        roundResults: {
          orderBy: { score: 'desc' },
          take: 1,
          include: { user: true },
        },
      },
    });

    for (const round of finishedRounds) {
      const winner = round.roundResults[0];
      
      await prisma.round.update({
        where: { id: round.id },
        data: {
          status: RoundStatus.FINISHED,
          winnerId: winner?.user.id,
          winnerName: winner?.user.username,
          winnerScore: winner?.score,
        },
      });
    }

    // Update active rounds
    await prisma.round.updateMany({
      where: {
        startTime: { lte: now },
        endTime: { gt: now },
        status: RoundStatus.COOLDOWN,
      },
      data: {
        status: RoundStatus.ACTIVE,
      },
    });
  }

  private calculateRoundStatus(startTime: Date, endTime: Date): RoundStatus {
    const now = new Date();
    
    if (now < startTime) {
      return RoundStatus.COOLDOWN;
    } else if (now >= startTime && now <= endTime) {
      return RoundStatus.ACTIVE;
    } else {
      return RoundStatus.FINISHED;
    }
  }
}