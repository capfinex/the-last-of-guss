import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useRoundStore } from '../stores/rounds';
import { Goose } from '../components/Goose';
import { RoundStatus } from '../types';

export const RoundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentRound, isLoading, error, fetchRound, tap, clearError, clearCurrentRound } = useRoundStore();
  
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) {
      navigate('/rounds');
      return;
    }

    fetchRound(id);
    
    return () => {
      clearCurrentRound();
    };
  }, [id, user, navigate, fetchRound, clearCurrentRound]);

  useEffect(() => {
    if (!currentRound) return;

    const updateTimer = () => {
      const now = new Date();
      const targetTime = currentRound.status === 'COOLDOWN' 
        ? new Date(currentRound.startTime) 
        : new Date(currentRound.endTime);
      
      const diff = targetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('00:00');
        // Refresh round data when time runs out
        setTimeout(() => fetchRound(id!), 1000);
        return;
      }
      
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [currentRound, fetchRound, id]);

  const handleTap = async () => {
    if (!currentRound || !id) return;
    
    await tap(id);
  };

  const getStatusTitle = (status: RoundStatus): string => {
    switch (status) {
      case 'COOLDOWN': return 'Cooldown';
      case 'ACTIVE': return 'Раунд активен!';
      case 'FINISHED': return 'Раунд завершен';
      default: return 'Раунд';
    }
  };

  const getStatusMessage = (status: RoundStatus): string => {
    switch (status) {
      case 'COOLDOWN': return `до начала раунда ${timeLeft}`;
      case 'ACTIVE': return `До конца осталось: ${timeLeft}`;
      case 'FINISHED': return '';
      default: return '';
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading && !currentRound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <p>Загрузка раунда...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
          <h1 className="text-xl font-bold text-red-400 mb-4">Ошибка</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex space-x-4">
            <Link
              to="/rounds"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition-colors"
            >
              К списку раундов
            </Link>
            <button
              onClick={() => {
                clearError();
                if (id) fetchRound(id);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentRound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Раунд не найден</p>
          <Link
            to="/rounds"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition-colors"
          >
            К списку раундов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl">
          <div className="bg-gray-700 px-6 py-4 rounded-t-lg border-b border-gray-600 flex justify-between items-center">
            <h1 className="text-lg font-bold text-white">
              {getStatusTitle(currentRound.status)}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">{user.username}</span>
              <Link
                to="/rounds"
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Раunds
              </Link>
            </div>
          </div>

          <div className="p-6 text-center">
            <Goose 
              canTap={currentRound.status === 'ACTIVE'} 
              onTap={handleTap}
            />

            <div className="space-y-2 text-white">
              <div className="text-lg font-medium">
                {getStatusTitle(currentRound.status)}
              </div>
              
              {currentRound.status !== 'FINISHED' && (
                <div className="text-primary-400">
                  {getStatusMessage(currentRound.status)}
                </div>
              )}

              {currentRound.status === 'ACTIVE' && (
                <div className="text-gray-300">
                  Мои очки - {currentRound.myScore ?? 0}
                </div>
              )}

              {currentRound.status === 'FINISHED' && (
                <div className="bg-gray-700 rounded-lg p-4 mt-4">
                  <div className="border-b border-gray-600 mb-3 pb-2 text-gray-300">
                    Статистика раунда
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">
                      Всего очков: <span className="text-white font-medium">{currentRound.totalScore}</span>
                    </div>
                    
                    {currentRound.winnerName && (
                      <div className="text-gray-300">
                        Победитель: <span className="text-primary-400 font-medium">
                          {currentRound.winnerName}
                        </span> - <span className="text-white font-medium">
                          {currentRound.winnerScore} очков
                        </span>
                      </div>
                    )}
                    
                    <div className="text-gray-300">
                      Мои очки: <span className="text-white font-medium">{currentRound.myScore ?? 0}</span>
                    </div>

                    {user.role === 'NIKITA' && (
                      <div className="text-red-400 text-xs mt-2 bg-red-900/20 border border-red-800 rounded p-2">
                        ! Ваши очки не засчитываются в общую статистику
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.role === 'NIKITA' && currentRound.status === 'ACTIVE' && (
                <div className="text-red-400 text-xs mt-4 bg-red-900/20 border border-red-800 rounded p-2">
                  ! Ваши очки не засчитываются в общую статистику
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="mt-4 bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Правила игры:</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• 1 тап = 1 очко</li>
            <li>• Каждый 11-й тап = 10 очков</li>
            <li>• Тапать можно только в активном раунде</li>
          </ul>
        </div>
      </div>
    </div>
  );
};