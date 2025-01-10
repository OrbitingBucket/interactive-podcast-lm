// src/components/PodcastFlow.tsx

import React from 'react';
import AudioPlayer from './AudioPlayer';
import Script from './Script'; // Import the new Script component
import { RaiseHandButton } from './RaiseHandButton';
import { usePodcastOrchestrator } from '../hooks/usePodcastOrchestrator';

export const PodcastFlow: React.FC = () => {
  const { 
    handleRaiseHand, 
    handleSegmentEnd, 
    canRaiseHand,
    state,
    isPlaying,
    togglePlayPause,
  } = usePodcastOrchestrator();

  const currentSegment = state.segments[state.currentSegmentIndex];

  return (
    <div className="podcast-flow w-full flex flex-col items-center justify-center flex-1 relative">
      {/* Audio Player */}
      {currentSegment ? (
        <AudioPlayer 
          segment={currentSegment} 
          onSegmentEnd={handleSegmentEnd} 
          onRaiseHand={handleRaiseHand}
          disabled={!canRaiseHand}
          liveTranscription={state.recognition.transcript}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
        />
      ) : (
        <div className="text-white">Loading podcast...</div>
      )}

      {/* Script Component */}
      {currentSegment && (
        <Script 
          segment={currentSegment}
          liveTranscription={state.recognition.transcript}
        />
      )}

      {/* Raise Hand Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <RaiseHandButton 
            onRaiseHand={handleRaiseHand}
            disabled={!canRaiseHand}
          />
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-4 rounded">
          {state.error}
        </div>
      )}
    </div>
  );
};

export default PodcastFlow;
