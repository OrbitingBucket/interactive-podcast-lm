// src/components/Script.tsx

import React from 'react';
import { PodcastSegment } from '../types/podcast';
import { usePodcastContext } from '../store/PodcastContext';

interface ScriptProps {
  segment: PodcastSegment;
  liveTranscription?: string;
}

export const Script: React.FC<ScriptProps> = ({ segment, liveTranscription }) => {
  const { state } = usePodcastContext();

  return (
    // Outer Rectangle
    <div className="script-container fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl bg-gray-800 bg-opacity-90 rounded-lg shadow-lg h-40 flex items-center justify-center">
      
      {/* Inner Rectangle */}
      {state.currentPhase === 'LISTENING' && liveTranscription ? (
        <div className="live-transcription bg-gray-700 rounded flex flex-col p-4 w-11/12 h-5/6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Question en cours :
          </h3>
          <p className="text-gray-300 text-base overflow-auto">
            {liveTranscription}
          </p>
        </div>
      ) : (
        <div
          className={`script ${
            segment.type === 'generated' ? 'bg-blue-700' : 'bg-gray-700'
          } rounded flex flex-col p-4 w-11/12 h-5/6`}
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            {segment.type === 'generated' ? 'Réponse :' : 'Script :'}
          </h3>
          <p className="text-gray-300 text-base overflow-auto">
            {segment.type === 'prerecorded' ? segment.script : segment.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default Script;
