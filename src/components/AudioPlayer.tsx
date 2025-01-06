// src/components/AudioPlayer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { PodcastSegment } from '../types/podcast';
import { RaiseHandButton } from './RaiseHandButton';

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
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
        let isSubscribed = true;
        
        const loadAndPlayAudio = async () => {
            if (!audioRef.current) return;
    
            try {
                let source: string | undefined = undefined;
                
                if (segment.type === "prerecorded") {
                    source = `/audio/${segment.audioFile}`;
                } else {
                    source = segment.audioSrc;
                }
    
                if (source) {
                    audioRef.current.src = source;
                    await audioRef.current.play();
                }
            } catch (err) {
                if (isSubscribed) {
                    console.error("Audio play error:", err);
                    setError("Failed to play audio. Please try again.");
                }
            }
        };
    
        loadAndPlayAudio();
    
        return () => {
            isSubscribed = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, [segment]);
  
    const handleEnded = () => {
        onSegmentEnd();
    };
  
    return (
        <div className="audio-player w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow relative">
            <audio 
                ref={audioRef} 
                onEnded={handleEnded}
                controls 
                className="w-full mb-4"
            />
            {error && (
                <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <div className="text-content mt-4">
                <p className="text-base mt-2">
                    {segment.type === "prerecorded" ? segment.script : segment.text}
                </p>
            </div>
            {segment.id === 'question-invite' && onRaiseHand && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <RaiseHandButton onRaiseHand={onRaiseHand} disabled={disabled} />
                </div>
            )}
        </div>
    );
};