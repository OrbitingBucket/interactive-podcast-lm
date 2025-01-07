// src/components/QuestionFlow.tsx
import React from 'react';
import { usePodcastContext } from '../store/PodcastContext';

export const QuestionFlow: React.FC = () => {
  const { state } = usePodcastContext();

  const getStateMessage = () => {
    switch (state.currentPhase) {
      case 'INVITATION':
        return 'Préparation pour votre question...';
      case 'LISTENING':
        return 'Nous vous écoutons...';
      case 'PROCESSING':
        return 'Traitement de votre question...';
      case 'ANSWERING':
        return 'Génération de la réponse...';
      default:
        return '';
    }
  };

  if (!['INVITATION', 'LISTENING', 'PROCESSING', 'ANSWERING'].includes(state.currentPhase)) {
    return null;
  }

  return (
    <div className="question-flow p-4 bg-blue-50 rounded-lg">
      <div className="status-message text-blue-700 font-medium">
        {getStateMessage()}
      </div>
      
      {state.currentPhase === 'PROCESSING' && (
        <div className="processing-indicator mt-2">
          <div className="animate-pulse bg-blue-200 h-2 w-full rounded"></div>
        </div>
      )}

      {state.currentPhase === 'ANSWERING' && (
        <div className="answer-indicator mt-2">
          <div className="bg-green-200 h-2 w-full rounded"></div>
        </div>
      )}
    </div>
  );
};