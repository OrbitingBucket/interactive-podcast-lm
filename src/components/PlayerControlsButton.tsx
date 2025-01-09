// src/components/PlayerControlsButton.tsx

import React from 'react';
import { Play, Pause } from 'lucide-react';

interface PlayerControlsButtonProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const PlayerControlsButton: React.FC<PlayerControlsButtonProps> = ({
  isPlaying,
  onTogglePlay,
  disabled = false,
  ariaLabel = 'Play/Pause',
}) => {
  return (
    <button
      onClick={onTogglePlay}
      disabled={disabled}
      className={`flex items-center justify-center p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition 
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label={ariaLabel}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};

export default PlayerControlsButton;
