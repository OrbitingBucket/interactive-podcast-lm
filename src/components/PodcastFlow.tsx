// src/components/PodcastFlow.tsx
import React, { useState } from 'react';
import { PreRecordedSegment } from '../types/podcast';
import { AudioPlayer } from './AudioPlayer';

interface PodcastFlowProps {
  preRecordedSegments: PreRecordedSegment[];
}

export const PodcastFlow: React.FC<PodcastFlowProps> = ({ preRecordedSegments }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSegmentEnd = () => {
    if (currentIndex < preRecordedSegments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentSegment = preRecordedSegments[currentIndex];

  if (!currentSegment) {
    return <div className="text-center p-4">Podcast is complete</div>;
  }

  return (
    <div className="podcast-flow p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Interactive AI Podcast</h1>
      <AudioPlayer
        segment={currentSegment}
        onSegmentEnd={handleSegmentEnd}
      />
      <div className="mt-4 text-center text-sm text-gray-600">
        Segment {currentIndex + 1} of {preRecordedSegments.length}
      </div>
    </div>
  );
};