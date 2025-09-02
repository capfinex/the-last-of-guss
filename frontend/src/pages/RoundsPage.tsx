import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useRoundStore } from '../stores/rounds';
import { Round, RoundStatus } from '../types';

export const RoundsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { rounds, isLoading, error, fetchRounds, createRound, clearError } = useRoundStore();

  useEffect(() => {
    fetchRounds();
    
    // Refresh rounds every 5 seconds
    const interval = setInterval(fetchRounds, 5000);
    return () => clearInterval(interval);
  }, [fetchRounds]);

  const handleCreateRound = async () => {
    const roundId = await createRound();
    if (roundId) {
      navigate(`/rounds/${roundId}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusText = (status: RoundStatus): string => {
    switch (status) {
      case 'COOLDOWN': return 'Cooldown';
      case 'ACTIVE': return 'Активен';
      case 'FINISHED': return 'Завершен';
      default: return 'Неизвестно';
    }
  };

  const getStatusColor = (status: RoundStatus): string => {
    switch (status) {
      case 'COOLDOWN': return 'text-yellow-400';
      case 'ACTIVE': return 'text-green-400';
      case 'FINISHED': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl">
          <div className="bg-gray-700 px-6 py-4 rounded-t-lg border-b border-gray-600 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Список РАУНДОВ</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user.username}</span>
              {user.role === 'ADMIN' && (
                <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
                  ADMIN
                </span>
              )}
              {user.role === 'NIKITA' && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                  NIKITA
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Выйти
              </button>
            </div>
          </div>

          <div className="p-6">
            {user.role === 'ADMIN' && (
              <div className="mb-6">
                <button
                  onClick={handleCreateRound}
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {isLoading ? 'Создаем...' : 'Создать раунд'}
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
                {error}
                <button
                  onClick={clearError}
                  className="ml-2 text-red-300 hover:text-red-200 underline"
                >
                  Закрыть
                </button>
              </div>
            )}

            <div className="space-y-4">
              {rounds.length === 0 && !isLoading && (
                <div className="text-center text-gray-400 py-8">
                  <p>Раундов пока нет</p>
                  {user.role === 'ADMIN' && (
                    <p className="text-sm mt-2">Создайте первый раунд!</p>
                  )}
                </div>
              )}

              {rounds.map((round: Round) => (
                <Link
                  key={round.id}
                  to={`/rounds/${round.id}`}
                  className="block bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-white font-medium mb-2">
                        ● Round ID: {round.id}
                      </div>
                      
                      <div className="text-gray-300 text-sm space-y-1">
                        <div>Start: {formatDateTime(round.startTime)}</div>
                        <div>End: {formatDateTime(round.endTime)}</div>
                      </div>
                      
                      <div className="border-t border-gray-600 my-3"></div>
                      
                      <div className={`font-medium ${getStatusColor(round.status)}`}>
                        Статус: {getStatusText(round.status)}
                      </div>

                      {round.status === 'FINISHED' && round.winnerName && (
                        <div className="text-gray-300 text-sm mt-2">
                          Победитель: {round.winnerName} ({round.winnerScore} очков)
                        </div>
                      )}

                      {round.myScore !== undefined && (
                        <div className="text-primary-400 text-sm mt-2">
                          Мои очки: {round.myScore}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {isLoading && rounds.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-2">Загрузка раундов...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};