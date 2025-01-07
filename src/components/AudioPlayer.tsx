// src/components/AudioPlayer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { PodcastSegment, GeneratedSegment } from '../types/podcast';
import { RaiseHandButton } from './RaiseHandButton';
import { usePodcastContext } from '../store/PodcastContext';

interface AudioPlayerProps {
  segment: PodcastSegment;
  onSegmentEnd: () => void;
  onRaiseHand?: () => void;
  disabled?: boolean;
  liveTranscription?: string;
}

const isGeneratedSegmentWithStream = (
  segment: PodcastSegment
): segment is GeneratedSegment & { audioStream: NonNullable<GeneratedSegment['audioStream']> } => {
  return segment.type === 'generated' && !!segment.audioStream;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  segment, 
  onSegmentEnd,
  onRaiseHand,
  disabled,
  liveTranscription 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { state } = usePodcastContext();

  useEffect(() => {
    let isSubscribed = true;
    const setupAudio = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        setIsLoading(true);
        setError(null); // Reset error on new segment

        if (segment.type === "prerecorded") {
          const source = `/audio/${segment.audioFile}`;
          console.log('Loading prerecorded audio:', source);
          audio.src = source;
          await audio.play();
          setIsLoading(false);
        } else if (isGeneratedSegmentWithStream(segment)) {
          console.log('Setting up streaming audio');

          // Collect the stream into a Blob
          const reader = segment.audioStream.getReader();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done || !isSubscribed) break;
            chunks.push(value);
          }

          // Combine chunks into a single Uint8Array
          const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }

          // Create a Blob from the combined data
          const blob = new Blob([combined], { type: 'audio/mpeg' }); // Ensure the type matches ElevenLabs output
          const blobUrl = URL.createObjectURL(blob);
          console.log('Generated Blob URL:', blobUrl);

          // Set the audio source to the Blob URL
          audio.src = blobUrl;
          await audio.play();
          setIsLoading(false);
        } else if (segment.type === "generated" && segment.audioSrc) {
          // Fallback for old implementation using audioSrc
          console.log('Loading audio from URL:', segment.audioSrc);
          audio.src = segment.audioSrc;
          await audio.play();
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Audio setup error:", err);
        if (isSubscribed) {
          setError("Failed to setup audio. Please try again.");
          setIsLoading(false);
        }
      }
    };

    setupAudio();

    return () => {
      isSubscribed = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [segment]);

  const handleEnded = () => {
    console.log('Audio ended:', segment.id);
    onSegmentEnd();
  };

  return (
    <div className="audio-player w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow relative">
      {isLoading && (
        <div className="loading-indicator text-blue-500 text-center mb-2">
          Loading audio...
        </div>
      )}
      
      <audio 
        ref={audioRef} 
        onEnded={handleEnded}
        controls 
        className="w-full mb-4"
        onError={(e) => {
          console.error('Audio error event:', e);
          setError("Audio playback error occurred.");
          setIsLoading(false);
        }}
      />
      
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
      <div className="text-content mt-4">
        {state.currentPhase === 'LISTENING' && liveTranscription ? (
          <div className="live-transcription bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-semibold mb-2">Question en cours :</h3>
            <p className="text-gray-700">{liveTranscription}</p>
          </div>
        ) : (
          <div className={`script ${
            segment.type === 'generated' ? 'bg-blue-50' : ''
          } p-3 rounded`}>
            <h3 className="text-lg font-semibold mb-2">
              {segment.type === 'generated' ? 'Réponse :' : 'Script :'}
            </h3>
            <p className="text-gray-700">
              {segment.type === 'prerecorded' ? segment.script : segment.text}
            </p>
          </div>
        )}
      </div>
      
      {segment.id === 'question-invite' && onRaiseHand && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <RaiseHandButton 
            onRaiseHand={onRaiseHand} 
            disabled={disabled} 
          />
        </div>
      )}
      
      {/* Debug info */}
      {segment.type === 'generated' && (
        <div className="debug-info text-xs text-gray-500 mt-2">
          <p>Audio source: {segment.audioSrc || 'Using stream'}</p>
          <p>Ready state: {audioRef.current?.readyState}</p>
        </div>
      )}
    </div>
  );
};
