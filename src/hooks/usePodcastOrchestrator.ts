// src/hooks/usePodcastOrchestrator.ts
import { useCallback, useEffect, useRef } from 'react';
import { usePodcastContext } from '../store/PodcastContext';
import { useAudioQueue } from './useAudioQueue';
import { useSpeechRecognition } from './useSpeechRecognition';
import { processWithFlowise } from '../utils/flowise';
import { generateSpeech } from '../utils/elevenlabs';
import { PreRecordedSegment, GeneratedSegment } from '../types/podcast';
import { preRecordedSegments } from '../data/segments';

const INVITATION_SEGMENT: PreRecordedSegment = {
  id: 'question-invite',
  type: 'prerecorded',
  host: 'Host1',
  audioFile: 'p01_e01_invite_q_h1.mp3',
  script: "Nous avons quelqu'un en ligne avec nous. Bonjour ! Présentez-vous et posez votre question."
};

export const usePodcastOrchestrator = () => {
  const { state, dispatch } = usePodcastContext();
  const audioQueue = useAudioQueue();
  const speechRecognition = useSpeechRecognition();
  const pendingInvitation = useRef(false);

  // Initialize podcast with pre-recorded segments
  useEffect(() => {
    if (state.currentPhase === 'INITIAL') {
      console.log('Initializing podcast with segments:', preRecordedSegments);
      dispatch({ type: 'SET_SEGMENTS', payload: preRecordedSegments });
      dispatch({ type: 'SET_PHASE', payload: 'PLAYING' });
    }
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup any resources or streams if needed
      if (audioQueue.currentAudioRef.current) {
        audioQueue.currentAudioRef.current.pause();
        audioQueue.currentAudioRef.current.srcObject = null;
      }
    };
  }, []);

  const handleRaiseHand = useCallback(async () => {
    console.log('Raise hand clicked, current phase:', state.currentPhase);
    
    try {
      if (state.currentPhase === 'PLAYING') {
        console.log('Handling raise hand in PLAYING phase');
        pendingInvitation.current = true;

        // Pre-initialize speech recognition
        console.log('Pre-initializing speech recognition');
        await speechRecognition.initialize();
        console.log('Speech recognition pre-initialized successfully');

        // Insert invitation segment after current segment
        const currentIndex = state.currentSegmentIndex;
        const newSegments = [...state.segments];
        newSegments.splice(currentIndex + 1, 0, INVITATION_SEGMENT);
        
        console.log('Injecting invitation segment after current segment');
        dispatch({ 
          type: 'SET_SEGMENTS', 
          payload: newSegments 
        });

      } else if (state.currentPhase === 'LISTENING') {
        console.log('Stopping speech recognition');
        const transcript = await speechRecognition.stop();
        console.log('Final transcript:', transcript);
        
        if (transcript.trim()) {
          dispatch({ type: 'SET_TRANSCRIPT', payload: transcript });
          dispatch({ type: 'SET_PHASE', payload: 'PROCESSING' });

          try {
            // Process with Flowise
            console.log('Processing with Flowise');
            const flowiseResponse = await processWithFlowise(transcript);
            console.log('Flowise response received:', flowiseResponse);

            if (!flowiseResponse) {
              throw new Error('No response received from Flowise');
            }

            // Generate speech from response
            console.log('Generating speech from response');
            const audioStream = await generateSpeech(flowiseResponse);
            console.log('Speech generated successfully');

            // Create answer segment
            const answerSegment: GeneratedSegment = {
              id: `answer-${Date.now()}`,
              type: 'generated',
              text: flowiseResponse,
              audioStream
            };

            // Add answer segment to queue
            console.log('Adding answer segment to queue');
            dispatch({
              type: 'SET_SEGMENTS',
              payload: [...state.segments, answerSegment]
            });

            dispatch({ type: 'SET_PHASE', payload: 'ANSWERING' });
          } catch (error) {
            console.error('Error processing response:', error);
            const errorMessage = error instanceof Error
              ? error.message
              : 'An unknown error occurred';
            dispatch({
              type: 'SET_ERROR',
              payload: `Failed to process question: ${errorMessage}`
            });
            dispatch({ type: 'SET_PHASE', payload: 'PLAYING' });
          }
        } else {
          console.log('No transcript captured, returning to PLAYING phase');
          dispatch({ type: 'SET_PHASE', payload: 'PLAYING' });
        }
      }
    } catch (error) {
      console.error('Error in handleRaiseHand:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred';
      dispatch({
        type: 'SET_ERROR',
        payload: `Error handling question: ${errorMessage}`
      });
      dispatch({ type: 'SET_PHASE', payload: 'PLAYING' });
    }
  }, [state.currentPhase, state.segments, state.currentSegmentIndex]);

  const handleSegmentEnd = useCallback(async () => {
    console.log('Segment ended:', state.segments[state.currentSegmentIndex]?.id);
    console.log('Current phase:', state.currentPhase);
    
    // Check if invitation segment just ended
    if (state.segments[state.currentSegmentIndex]?.id === 'question-invite') {
      console.log('Invitation segment ended, starting listening phase');
      dispatch({ type: 'SET_PHASE', payload: 'LISTENING' });
      try {
        await speechRecognition.start();
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to start speech recognition'
        });
        dispatch({ type: 'SET_PHASE', payload: 'PLAYING' });
      }
      return;
    }

    // Handle pending invitation
    if (pendingInvitation.current) {
      console.log('Processing pending invitation');
      pendingInvitation.current = false;
      dispatch({ type: 'SET_PHASE', payload: 'INVITATION' });
    }

    // If we just finished playing an answer, return to normal playing state
    if (state.currentPhase === 'ANSWERING') {
      console.log('Answer segment ended, returning to PLAYING phase');
      dispatch({ type: 'SET_PHASE', payload: 'PLAYING' });
    }

    // Move to next segment if available
    const nextIndex = state.currentSegmentIndex + 1;
    if (nextIndex < state.segments.length) {
      console.log('Moving to next segment:', nextIndex);
      dispatch({ type: 'SET_CURRENT_SEGMENT', payload: nextIndex });
    } else {
      console.log('No more segments available');
    }
  }, [state.currentPhase, state.currentSegmentIndex, state.segments]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return {
    state,
    handleRaiseHand,
    handleSegmentEnd,
    clearError,
    currentSegment: state.segments[state.currentSegmentIndex],
    isQuestionMode: ['INVITATION', 'LISTENING', 'PROCESSING', 'ANSWERING'].includes(
      state.currentPhase
    ),
    canRaiseHand: ['PLAYING', 'LISTENING'].includes(state.currentPhase),
    transcription: state.recognition.transcript,
  };
};