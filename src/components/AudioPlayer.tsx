// src/components/AudioPlayer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { PodcastSegment } from '../types/podcast';
import { RaiseHandButton } from './RaiseHandButton';
import { usePodcastContext } from '../store/PodcastContext';

interface AudioPlayerProps {
    segment: PodcastSegment;
    onSegmentEnd: () => void;
    onRaiseHand?: () => void;
    disabled?: boolean;
    liveTranscription?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    segment, 
    onSegmentEnd,
    onRaiseHand,
    disabled,
    liveTranscription 
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { state } = usePodcastContext();
  
    useEffect(() => {
        let isSubscribed = true;
        
        const loadAndPlayAudio = async () => {
            if (!audioRef.current) return;
    
            try {
                setIsLoading(true);
                
                if (segment.type === "prerecorded") {
                    const source = `/audio/${segment.audioFile}`;
                    console.log('Loading prerecorded audio:', source);
                    audioRef.current.src = source;
                    await audioRef.current.play();
                } else {
                    console.log('Setting up streaming audio');
                    if (!audioContextRef.current) {
                        audioContextRef.current = new AudioContext();
                    }
                    
                    const source = audioContextRef.current.createMediaStreamSource(segment.audioStream);
                    const destination = audioContextRef.current.destination;
                    source.connect(destination);
                }
                
                console.log('Audio playback started');
                setIsLoading(false);
                
            } catch (err) {
                console.error("Audio load/play error:", err);
                if (isSubscribed) {
                    setError("Failed to play audio. Please try again.");
                    setIsLoading(false);
                }
            }
        };
    
        loadAndPlayAudio();
    
        return () => {
            isSubscribed = false;
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
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
                    <p>Audio source: {segment.audioSrc}</p>
                    <p>Current time: {audioRef.current?.currentTime}</p>
                    <p>Duration: {audioRef.current?.duration}</p>
                    <p>Ready state: {audioRef.current?.readyState}</p>
                </div>
            )}
        </div>
    );
};