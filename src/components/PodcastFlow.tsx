// src/components/PodcastFlow.tsx

import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import Script from './Script';
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

  // State for tracking current time and duration
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Callback to handle time updates from AudioPlayer
  const handleTimeUpdate = (current: number, dur: number) => {
    setCurrentTime(current);
    setDuration(dur);
  };

  // Reset time and duration when segment changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentSegment]);

  return (
    <div className="podcast-flow w-full flex flex-col items-center justify-center flex-1 relative mb-64">
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
          onTimeUpdate={handleTimeUpdate} // Pass the callback
        />
      ) : (
        <div className="text-white">Loading podcast...</div>
      )}

      {/* Script Component */}
      {currentSegment && (
        <Script 
          segment={currentSegment}
          liveTranscription={state.recognition.transcript}
          currentTime={currentTime} // Pass current time
          duration={duration}       // Pass duration
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
