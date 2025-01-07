// src/components/AudioFlow.tsx
import React from 'react';
import { AudioPlayer } from './AudioPlayer';
import { usePodcastContext } from '../store/PodcastContext';

interface AudioFlowProps {
  onSegmentEnd: () => void;  // Add this prop
}

export const AudioFlow: React.FC<AudioFlowProps> = ({ onSegmentEnd }) => {  // Receive the prop
  const { state } = usePodcastContext();
  const currentSegment = state.segments[state.currentSegmentIndex];

  if (!currentSegment) return null;

  return (
    <div className="audio-flow">
      <AudioPlayer
        segment={currentSegment}
        onSegmentEnd={onSegmentEnd}  // Pass it to AudioPlayer
        disabled={state.currentPhase === 'PROCESSING'}
        liveTranscription={
          state.currentPhase === 'LISTENING' ? state.recognition.transcript : undefined
        }
      />
    </div>
  );
};