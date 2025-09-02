import { create } from 'zustand';
import { Round, TapResponse, ApiError } from '../types';
import { apiService } from '../services/api';

interface RoundState {
  rounds: Round[];
  currentRound: Round | null;
  isLoading: boolean;
  error: string | null;
  fetchRounds: () => Promise<void>;
  fetchRound: (id: string) => Promise<void>;
  createRound: () => Promise<string | null>;
  tap: (roundId: string) => Promise<TapResponse | null>;
  clearError: () => void;
  clearCurrentRound: () => void;
}

export const useRoundStore = create<RoundState>((set, get) => ({
  rounds: [],
  currentRound: null,
  isLoading: false,
  error: null,

  fetchRounds: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const rounds = await apiService.getRounds();
      set({ rounds, isLoading: false });
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Failed to fetch rounds', 
        isLoading: false 
      });
    }
  },

  fetchRound: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const round = await apiService.getRound(id);
      set({ currentRound: round, isLoading: false });
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Failed to fetch round', 
        isLoading: false 
      });
    }
  },

  createRound: async (): Promise<string | null> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.createRound();
      set({ isLoading: false });
      
      // Refresh rounds list
      get().fetchRounds();
      
      return response.roundId;
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Failed to create round', 
        isLoading: false 
      });
      return null;
    }
  },

  tap: async (roundId: string): Promise<TapResponse | null> => {
    try {
      const response = await apiService.tap(roundId);
      
      // Update current round with new scores
      const { currentRound } = get();
      if (currentRound && currentRound.id === roundId) {
        set({
          currentRound: {
            ...currentRound,
            myScore: response.myScore,
            myTaps: response.myTaps,
          }
        });
      }
      
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || 'Failed to register tap' });
      return null;
    }
  },

  clearError: (): void => {
    set({ error: null });
  },

  clearCurrentRound: (): void => {
    set({ currentRound: null });
  },
}));