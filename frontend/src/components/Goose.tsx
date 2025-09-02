import React, { useState } from 'react';
import { clsx } from 'clsx';

interface GooseProps {
  canTap: boolean;
  onTap: () => void;
}

export const Goose: React.FC<GooseProps> = ({ canTap, onTap }) => {
  const [isWiggling, setIsWiggling] = useState(false);

  const handleClick = () => {
    if (!canTap) return;
    
    setIsWiggling(true);
    onTap();
    
    setTimeout(() => setIsWiggling(false), 500);
  };

  return (
    <div className="flex justify-center mb-8">
      <div
        onClick={handleClick}
        className={clsx(
          'select-none text-6xl transition-transform duration-300',
          canTap && 'cursor-pointer hover:scale-110',
          !canTap && 'cursor-not-allowed opacity-50',
          isWiggling && 'animate-wiggle'
        )}
        style={{
          filter: canTap ? 'drop-shadow(0 0 10px rgba(245, 147, 64, 0.5))' : 'none'
        }}
      >
        <pre className="leading-tight font-mono text-xs text-center">
{`       ░░░░░░░░░░░░░░░
    ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
  ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
 ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░
░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░
░░▒▒▒▒░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░▒▒▒▒░░
░░▒▒▒▒▒▒▒▒░░░░░░░░░░░░▒▒▒▒▒▒▒▒░░
░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
 ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░
   ░░░░░░░░░░░░░░░░░░░░░░░░░░`}
        </pre>
      </div>
    </div>
  );
};