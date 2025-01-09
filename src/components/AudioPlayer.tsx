// src/components/AudioPlayer.tsx

import React, { useRef, useEffect, useState } from 'react';
import { PodcastSegment, GeneratedSegment } from '../types/podcast';
import { RaiseHandButton } from './RaiseHandButton';
import { usePodcastContext } from '../store/PodcastContext';
import AudioVisualizer from './visualizer/AudioVisualizer';
import PlayerControlsButton from './PlayerControlsButton'; // Import the new component

interface AudioPlayerProps {
  segment: PodcastSegment;
  onSegmentEnd: () => void;
  onRaiseHand?: () => void;
  disabled?: boolean;
  liveTranscription?: string;
  isPlaying: boolean; // Receive isPlaying prop
  togglePlayPause: () => void; // Receive togglePlayPause prop
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
  liveTranscription,
  isPlaying,
  togglePlayPause
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { state } = usePodcastContext();
  const mediaSourceRef = useRef<MediaSource | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    let currentSourceUrl: string | null = null;

    const cleanupAudio = () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        if (currentSourceUrl) {
          URL.revokeObjectURL(currentSourceUrl);
        }
        audio.src = '';
      }
      if (mediaSourceRef.current) {
        mediaSourceRef.current = null;
      }
      setIsLoading(true);
    };

    const setupAudio = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      try {
        setIsLoading(true);
        setError(null);

        // Clean up previous audio setup
        cleanupAudio();

        if (segment.type === "prerecorded") {
          const source = `/audio/${segment.audioFile}`;
          console.log('Loading prerecorded audio:', source);
          audio.src = source;
          setIsLoading(false);
          // Auto-play if isPlaying is true
          if (isPlaying) {
            await audio.play();
          }
        } else if (isGeneratedSegmentWithStream(segment)) {
          console.log('Setting up streaming audio');

          // Create a new MediaSource
          console.log('Creating new MediaSource for streaming audio');
          const mediaSource = new MediaSource();
          mediaSourceRef.current = mediaSource;
          currentSourceUrl = URL.createObjectURL(mediaSource);
          console.log('Created MediaSource URL:', currentSourceUrl);
          audio.src = currentSourceUrl;

          const handleSourceOpen = async () => {
            console.log('MediaSource opened, setting up source buffer');
            try {
              const mimeType = 'audio/mpeg';
              console.log('Adding source buffer with MIME type:', mimeType);
              const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
              const reader = segment.audioStream.getReader();
              
              console.log('Starting to read audio stream');
              while (true) {
                const { done, value } = await reader.read();
                if (done || !isSubscribed) {
                  console.log('Stream reading complete or unsubscribed');
                  break;
                }

                // Wait for the previous append to complete
                if (!sourceBuffer.updating) {
                  console.log('Appending chunk to source buffer, size:', value.length);
                  sourceBuffer.appendBuffer(value);
                  await new Promise<void>((resolve) => {
                    sourceBuffer.addEventListener('updateend', () => resolve(), { once: true });
                  });
                }
              }

              if (isSubscribed) {
                console.log('Stream processing complete, ending stream');
                mediaSource.endOfStream();
                setIsLoading(false);
                // Auto-play if isPlaying is true
                if (isPlaying) {
                  await audio.play();
                }
              }
            } catch (err) {
              console.error('Error in sourceopen handler:', err);
              if (isSubscribed) {
                setError('Failed to process audio stream');
                setIsLoading(false);
              }
            }
          };

          mediaSource.addEventListener('sourceopen', handleSourceOpen, { once: true });
          mediaSource.addEventListener('error', (err) => {
            console.error('MediaSource error:', err);
            if (isSubscribed) {
              setError('Media source error occurred');
              setIsLoading(false);
            }
          });

        } else if (segment.type === "generated" && segment.audioSrc) {
          // Fallback for direct URL sources
          console.log('Loading audio from URL:', segment.audioSrc);
          audio.src = segment.audioSrc;
          setIsLoading(false);
          // Auto-play if isPlaying is true
          if (isPlaying) {
            await audio.play();
          }
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
      cleanupAudio();
    };
  }, [segment, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        setError('Unable to play audio.');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleEnded = () => {
    console.log('Audio ended:', segment.id);
    onSegmentEnd();
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio error event:', e);
    const audio = e.currentTarget;
    let errorMessage = "Audio playback error occurred.";
    
    if (audio.error) {
      errorMessage += ` Code: ${audio.error.code}`;
      if (audio.error.message) {
        errorMessage += ` Message: ${audio.error.message}`;
      }
    }
    
    setError(errorMessage);
    setIsLoading(false);
  };

  // Remove local isPlaying state and togglePlayPause

  // Defensive Check: Ensure segment is defined
  if (!segment) {
    return <div className="text-white">No audio segment available.</div>; // Optional: Alternative Loading or Error Message
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      {/* Flex Container for Controls and Visualizer */}
      <div className="flex flex-row items-center space-x-4 md:space-x-6">
        {/* Player Controls Button */}
        <PlayerControlsButton
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          disabled={isLoading || !!error}
          ariaLabel={isPlaying ? "Pause" : "Play"}
        />

        {/* Audio Visualizer */}
        <AudioVisualizer audioElement={audioRef.current} className="w-full max-w-md" />
      </div>

      {/* Main Player UI */}
      <div className="audio-player w-full max-w-2xl mx-auto p-4 bg-gray-800 bg-opacity-75 rounded-lg shadow relative z-10 mt-8">
        {isLoading && (
          <div className="loading-indicator text-blue-500 text-center mb-2">
            Loading audio...
          </div>
        )}
      
        {/* Hidden Audio Element */}
        <audio 
          ref={audioRef} 
          onEnded={handleEnded}
          onError={handleError}
          className="hidden" // Hide default controls
        />

        {error && (
          <div className="text-red-500 text-sm mb-2 flex flex-col items-center">
            <p>{error}</p>
            <button
              onClick={togglePlayPause} // Retry by toggling play
              className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="text-content mt-4">
          {state.currentPhase === 'LISTENING' && liveTranscription ? (
            <div className="live-transcription bg-gray-700 p-3 rounded">
              <h3 className="text-lg font-semibold mb-2 text-white">Question en cours :</h3>
              <p className="text-gray-300">{liveTranscription}</p>
            </div>
          ) : (
            <div className={`script ${
              segment.type === 'generated' ? 'bg-blue-700' : 'bg-gray-700'
            } p-3 rounded`}>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {segment.type === 'generated' ? 'Réponse :' : 'Script :'}
              </h3>
              <p className="text-gray-300">
                {segment.type === 'prerecorded' ? segment.script : segment.text}
              </p>
            </div>
          )}
        </div>
        
        {segment.id === 'question-invite' && onRaiseHand && (
          <div className="mt-4 flex justify-center">
            <RaiseHandButton 
              onRaiseHand={onRaiseHand} 
              disabled={disabled} 
            />
          </div>
        )}
        
        {/* Debug info */}
        {segment.type === 'generated' && (
          <div className="debug-info text-xs text-gray-400 mt-2">
            <p>Audio source: {segment.audioSrc || 'Using stream'}</p>
            <p>Ready state: {audioRef.current?.readyState}</p>
            <p>Media Source state: {mediaSourceRef.current?.readyState}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
