// src/components/RaiseHandButton.tsx

import React from 'react';
import { Hand } from 'lucide-react';

interface RaiseHandButtonProps {
  onRaiseHand: () => void;
  disabled?: boolean;
}

export const RaiseHandButton: React.FC<RaiseHandButtonProps> = ({ onRaiseHand, disabled }) => {
  return (
    <button
      onClick={onRaiseHand}
      disabled={disabled}
      className="fixed bottom-8 right-8 p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-300 disabled:opacity-50"
      aria-label="Raise Hand"
    >
      <Hand size={24} />
    </button>
  );
};