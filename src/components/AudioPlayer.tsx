// src/components/AudioPlayer.tsx

import React, { useRef, useEffect } from 'react';
import { PodcastSegment } from '../types/podcast';

interface AudioPlayerProps {
  segment: PodcastSegment;
  onSegmentEnd: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ segment, onSegmentEnd }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let source: string | undefined = undefined;
    
    if (segment.type === "prerecorded") {
      source = `/audio/${segment.audioFile}`;
    } else {
      source = segment.audioSrc;
    }

    if (source && audioRef.current) {
      audioRef.current.src = source;
      audioRef.current.play().catch((err) => {
        console.error("Audio play error:", err);
      });
    }
  }, [segment]);

  const handleEnded = () => {
    onSegmentEnd();
  };

  return (
    <div className="audio-player w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <audio 
        ref={audioRef} 
        onEnded={handleEnded}
        controls 
        className="w-full mb-4"
      />
      <div className="text-content mt-4">
        <p className="text-sm text-gray-600">Host: {segment.host}</p>
        <p className="text-base mt-2">
          {segment.type === "prerecorded" ? segment.script : segment.text}
        </p>
      </div>
    </div>
  );
};