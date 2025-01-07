// src/hooks/useSpeechRecognition.ts
import { useCallback, useRef, useState } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { config } from '../config/env';
import { usePodcastContext } from '../store/PodcastContext';

export const useSpeechRecognition = () => {
  const recognizer = useRef<sdk.SpeechRecognizer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { dispatch } = usePodcastContext();
  const transcriptRef = useRef<string>(''); // Keep track of full transcript

  const initialize = useCallback(async () => {
    try {
      console.log('Initializing speech recognition...');
      
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        config.azure.key,
        config.azure.region
      );
      speechConfig.speechRecognitionLanguage = 'fr-FR';

      // Enable detailed recognition results
      speechConfig.enableDictation();
      speechConfig.outputFormat = sdk.OutputFormat.Detailed;

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      recognizer.current = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Handle interim results
      recognizer.current.recognizing = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
          const interim = e.result.text;
          // Combine interim with previous final results
          const fullTranscript = `${transcriptRef.current} ${interim}`;
          console.log('Interim transcript:', fullTranscript);
          dispatch({ 
            type: 'SET_TRANSCRIPT', 
            payload: fullTranscript.trim() 
          });
        }
      };

      // Handle final results
      recognizer.current.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          // Append new final result to transcript
          transcriptRef.current += ' ' + e.result.text;
          transcriptRef.current = transcriptRef.current.trim();
          console.log('Updated transcript:', transcriptRef.current);
          dispatch({ 
            type: 'SET_TRANSCRIPT', 
            payload: transcriptRef.current 
          });
        }
      };

      // Handle errors
      recognizer.current.canceled = (s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          console.error(`Speech recognition error: ${e.errorDetails}`);
          dispatch({
            type: 'SET_ERROR',
            payload: `Speech recognition error: ${e.errorDetails}`
          });
        }
      };

      // Pre-initialize the recognition session
      await new Promise<void>((resolve, reject) => {
        recognizer.current!.startContinuousRecognitionAsync(
          () => {
            console.log('Recognition pre-initialized');
            // Immediately stop after initialization
            recognizer.current!.stopContinuousRecognitionAsync(
              () => {
                console.log('Recognition stopped after pre-initialization');
                setIsInitialized(true);
                resolve();
              },
              (error) => reject(error)
            );
          },
          (error) => reject(error)
        );
      });

      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      throw error;
    }
  }, []);

  const start = useCallback(async () => {
    if (!recognizer.current) {
      throw new Error('Speech recognizer not initialized');
    }

    try {
      console.log('Starting speech recognition...');
      // Reset transcript for new recording
      transcriptRef.current = '';
      dispatch({ type: 'SET_TRANSCRIPT', payload: '' });

      await new Promise<void>((resolve, reject) => {
        recognizer.current!.startContinuousRecognitionAsync(
          () => {
            console.log('Recognition started successfully');
            resolve();
          },
          (error) => {
            console.error('Failed to start recognition:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Error in start:', error);
      throw error;
    }
  }, []);

  const stop = useCallback(async () => {
    if (!recognizer.current) {
      throw new Error('Speech recognizer not initialized');
    }

    try {
      console.log('Stopping speech recognition...');
      
      await new Promise<void>((resolve, reject) => {
        recognizer.current!.stopContinuousRecognitionAsync(
          () => {
            console.log('Recognition stopped successfully');
            resolve();
          },
          (error) => {
            console.error('Failed to stop recognition:', error);
            reject(error);
          }
        );
      });

      // Return the final transcript
      const finalTranscript = transcriptRef.current;
      console.log('Final transcript:', finalTranscript);
      
      // Cleanup
      recognizer.current = null;
      setIsInitialized(false);
      
      return finalTranscript;
    } catch (error) {
      console.error('Error in stop:', error);
      throw error;
    }
  }, []);

  return {
    initialize,
    start,
    stop,
    isInitialized,
  };
};