// src/components/PodcastFlow.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { PreRecordedSegment, PodcastSegment, DynamicSegment } from '../types/podcast';
import { AudioPlayer } from './AudioPlayer';
import { RaiseHandButton } from './RaiseHandButton';
import SpeechRecognition from './SpeechRecognition';

interface PodcastFlowProps {
    preRecordedSegments: PreRecordedSegment[];
}

type QAState = 'inactive' | 'waiting' | 'listening' | 'processing';

export const PodcastFlow: React.FC<PodcastFlowProps> = ({ preRecordedSegments }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [qaState, setQAState] = useState<QAState>('inactive');
    const [segments, setSegments] = useState<PodcastSegment[]>(preRecordedSegments);
    const [liveTranscription, setLiveTranscription] = useState<string>('');
    const [recognitionError, setRecognitionError] = useState<string | null>(null);

    // Combined callback to handle transcription and processing
    const handleTranscription = useCallback((transcript: string) => {
        if (!transcript.trim()) return;

        // Update live transcription state
        setLiveTranscription(transcript);

        // Create a new dynamic segment for the user's question
        const questionSegment: DynamicSegment = {
            id: `question-${Date.now()}`,
            type: 'dynamic',
            host: 'You', // Changed to 'You' to indicate it's the user's question
            text: transcript,
        };

        // Insert the question segment after the current segment
        const newSegments = [...segments];
        newSegments.splice(currentIndex + 1, 0, questionSegment);
        setSegments(newSegments);
        
        // Update QA state to processing to display transcription
        setQAState('processing');
    }, [segments, currentIndex]);

    const handleRecognitionError = useCallback((error: string) => {
        console.error('Speech recognition error:', error);
        setRecognitionError(error);
        setQAState('inactive');
    }, []);

    const handleRaiseHand = () => {
        setQAState('waiting');
        setLiveTranscription('');
        setRecognitionError(null);
        
        // Insert the question invitation segment after the current segment
        const questionInviteSegment: PreRecordedSegment = {
            id: 'question-invite',
            type: 'prerecorded',
            host: 'Host1',
            audioFile: 'p01_e01_invite_q_h1.mp3',
            script: 'Nous avons quelqu’un en ligne avec nous. Bonjour ! Présentez-vous et posez votre question.',
        };

        const newSegments = [...segments];
        newSegments.splice(currentIndex + 1, 0, questionInviteSegment);
        setSegments(newSegments);
    };

    const handleSegmentEnd = () => {
        if (currentIndex < segments.length - 1) {
            // If we just finished playing the question invitation
            if (segments[currentIndex].id === 'question-invite') {
                setQAState('listening');
            } else {
                setCurrentIndex(currentIndex + 1);
            }
        }
    };

    const getBackgroundColor = () => {
        switch (qaState) {
            case 'waiting':
                return 'bg-yellow-100';
            case 'listening':
                return 'bg-green-100';
            case 'processing':
                return 'bg-blue-100';
            default:
                return 'bg-gray-100';
        }
    };

    const currentSegment = segments[currentIndex];

    if (!currentSegment) {
        return <div className="text-center p-4">Podcast is complete</div>;
    }

    return (
        <div className={`podcast-flow p-4 min-h-screen transition-colors duration-300 ${getBackgroundColor()}`}>
            <h1 className="text-2xl font-bold text-center">Radio Artelia</h1>
            <h2 className="text-3x1 mb-4 text-center">Projets et genre</h2>
            <AudioPlayer
                segment={currentSegment}
                onSegmentEnd={handleSegmentEnd}
                liveTranscription={qaState === 'processing' ? liveTranscription : ''}
                disabled={qaState !== 'inactive'}
            />
            <div className="mt-4 text-center text-sm text-gray-600">
                Segment {currentIndex + 1} of {segments.length}
            </div>
            <RaiseHandButton 
                onRaiseHand={handleRaiseHand}
                disabled={qaState !== 'inactive'}
            />
            
            {/* Render Live Transcription Below the Audio Player */}
            {qaState === 'processing' && liveTranscription && (
                <div className="transcription mt-6 p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
                    <h2 className="text-lg font-semibold mb-2">Votre question:</h2>
                    <p className="text-gray-700">{liveTranscription}</p>
                </div>
            )}

            {qaState === 'listening' && (
                <>
                    <SpeechRecognition
                        isListening={true}
                        onTranscriptionComplete={handleTranscription}
                        onError={handleRecognitionError}
                    />
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full animate-pulse">
                        Listening...
                    </div>
                </>
            )}
            {recognitionError && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
                    {recognitionError}
                </div>
            )}
        </div>
    );
};
