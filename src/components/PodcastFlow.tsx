// src/components/PodcastFlow.tsx
import React from 'react';
import { AudioFlow } from './AudioFlow';
import { QuestionFlow } from './QuestionFlow';
import { RaiseHandButton } from './RaiseHandButton';
import { usePodcastOrchestrator } from '../hooks/usePodcastOrchestrator';

export const PodcastFlow: React.FC = () => {
  const { 
    state, 
    handleRaiseHand, 
    handleSegmentEnd,
    transcription,
    canRaiseHand,
    isQuestionMode
  } = usePodcastOrchestrator();

  return (
    <div className="podcast-flow max-w-4xl mx-auto p-4">
      <AudioFlow onSegmentEnd={handleSegmentEnd} />
      
      {isQuestionMode && (
        <div className="question-mode-container mt-4">
          <QuestionFlow />
          {state.currentPhase === 'LISTENING' && (
            <div className="transcription-container p-4 bg-gray-100 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-2">Question :</h3>
              <p className="text-gray-700">{transcription || 'Parlez maintenant...'}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="fixed bottom-8 right-8">
        <RaiseHandButton 
          onRaiseHand={handleRaiseHand}
          disabled={!canRaiseHand}
        />
      </div>
      
      {state.error && (
        <div className="error-message fixed top-4 right-4 bg-red-500 text-white p-4 rounded">
          {state.error}
        </div>
      )}
    </div>
  );
};