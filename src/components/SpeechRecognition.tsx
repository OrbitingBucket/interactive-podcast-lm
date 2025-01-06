// src/components/SpeechRecognition.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';

interface SpeechRecognitionProps {
  isListening: boolean;
  onTranscriptionComplete: (text: string) => void;
  onError: (error: string) => void;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  isListening,
  onTranscriptionComplete,
  onError
}) => {
  const [micPermission, setMicPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognizerRef = useRef<any | null>(null); // Holds the recognizer instance
  const speechSdkRef = useRef<any | null>(null); // Holds the speech SDK
  
  const accumulatedTextRef = useRef<string>("");

  // Throttle transcription updates to prevent too frequent UI updates
  const throttledTranscription = useCallback(
    throttle((text: string) => {
      onTranscriptionComplete(text);
    }, 500),
    [onTranscriptionComplete]
  );

  // Check microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      return true;
    } catch (error) {
      setMicPermission(false);
      onError('Microphone access denied. Please allow microphone access to use speech recognition.');
      return false;
    }
  }, [onError]);

  // Initialize the Speech Recognizer
  const initializeSpeechRecognizer = useCallback(async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      onError('Speech recognition is only available in browser environments');
      return null;
    }

    const AZURE_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_COGNITIVE_KEY || 
                                   process.env.REACT_APP_AZURE_COGNITIVE_KEY;
    const AZURE_REGION = import.meta.env.VITE_AZURE_COGNITIVE_REGION || 
                        process.env.REACT_APP_AZURE_COGNITIVE_REGION;

    if (!AZURE_SUBSCRIPTION_KEY || !AZURE_REGION) {
      const missing = `Azure Cognitive Services configuration missing. Please check your environment variables.`;
      console.error(missing);
      onError(missing);
      return null;
    }

    // Dynamically import the Speech SDK
    try {
      const speechSdk = await import('microsoft-cognitiveservices-speech-sdk');
      speechSdkRef.current = speechSdk;

      console.log(`Initializing recognizer with region: ${AZURE_REGION}`);
      const speechConfig = speechSdk.SpeechConfig.fromSubscription(
        AZURE_SUBSCRIPTION_KEY,
        AZURE_REGION
      );
      speechConfig.speechRecognitionLanguage = "fr-FR";

      // Enable detailed logging
      speechConfig.setProperty(
        speechSdk.PropertyId.SpeechServiceConnection_LogLevel,
        speechSdk.LogLevel.Debug
      );

      const audioConfig = speechSdk.AudioConfig.fromDefaultMicrophoneInput();
      if (!audioConfig) {
        throw new Error("Could not initialize audio input");
      }

      const recognizer = new speechSdk.SpeechRecognizer(speechConfig, audioConfig);
      console.log("Speech recognizer created successfully");
      return recognizer;
    } catch (error: any) {
      console.error("Speech SDK initialization error:", error);
      onError(`Failed to initialize speech recognition: ${error.message}`);
      return null;
    }
  }, [onError]);

  // Define stopRecording before any function that uses it
  const stopRecording = useCallback(async () => {
    const recognizer = recognizerRef.current;
    if (!recognizer) {
      onError("Speech recognizer not initialized.");
      setIsSpeaking(false);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            console.log("Recognition stopped successfully");
            setIsSpeaking(false);
            resolve();
          },
          (err: Error) => {
            console.error("Error stopping recognition:", err);
            onError(`Failed to stop recognition: ${err.message}`);
            setIsSpeaking(false);
            reject(err);
          }
        );
      });
    } catch (stopError: any) {
      console.error("Error in stopRecording:", stopError);
      onError(`Stop Recording Error: ${stopError.message}`);
    }
  }, [onError]);

  // Define startRecording after stopRecording
  const startRecording = useCallback(async () => {
    const recognizer = recognizerRef.current;
    if (!recognizer) {
      onError("Speech recognizer not initialized. Please try again.");
      return;
    }

    try {
      accumulatedTextRef.current = ""; // Reset accumulated text
      onTranscriptionComplete(""); // Reset parent transcription

      setIsSpeaking(true);
      await new Promise<void>((resolve, reject) => {
        recognizer.startContinuousRecognitionAsync(
          () => {
            console.log("Recognition started successfully");
            resolve();
          },
          (err: Error) => {
            console.error("Error starting recognition:", err);
            onError(`Failed to start recognition: ${err.message}`);
            setIsSpeaking(false);
            reject(err);
          }
        );
      });
    } catch (startError: any) {
      console.error("Error in startRecording:", startError);
      onError(`Recording Error: ${startError.message}`);
      setIsSpeaking(false);
    }
  }, [onTranscriptionComplete, onError]);

  // Setup event handlers for the recognizer
  const setupEventHandlers = useCallback(() => {
    const recognizer = recognizerRef.current;
    const speechSdk = speechSdkRef.current;
    if (!recognizer || !speechSdk) return;

    recognizer.recognizing = (s: any, e: any) => {
      console.log(`RECOGNIZING: Text=${e.result.text}`);
      if (e.result.text) {
        const interimText = e.result.text;
        throttledTranscription(`${accumulatedTextRef.current} ${interimText}`);
      }
    };

    recognizer.recognized = (s: any, e: any) => {
      if (e.result.reason === speechSdk.ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
        if (e.result.text) {
          accumulatedTextRef.current = `${accumulatedTextRef.current} ${e.result.text}`.trim();
          throttledTranscription(accumulatedTextRef.current);
        }
      } else if (e.result.reason === speechSdk.ResultReason.NoMatch) {
        console.log(`NOMATCH: Speech could not be recognized.`);
      }
    };

    recognizer.canceled = (s: any, e: any) => {
      console.log(`CANCELED: Reason=${e.reason}`);
      if (e.reason === speechSdk.CancellationReason.Error) {
        console.error(`CANCELED: ErrorCode=${e.errorCode}`);
        console.error(`CANCELED: ErrorDetails=${e.errorDetails}`);
        onError(`Recognition canceled: ${e.errorDetails}`);
      }
      stopRecording();
    };

    recognizer.sessionStopped = (s: any, e: any) => {
      console.log("\nSession stopped event.");
      stopRecording();
    };
  }, [throttledTranscription, onError, stopRecording]);

  // Initialize recognizer and check permissions on mount
  useEffect(() => {
    const setup = async () => {
      const hasPermission = await checkMicrophonePermission();
      if (hasPermission) {
        const recognizer = await initializeSpeechRecognizer();
        if (recognizer) {
          recognizerRef.current = recognizer;
          setupEventHandlers();
          console.log("Speech recognizer initialized successfully");
        }
      }
      setIsInitializing(false);
    };

    setup();

    // Cleanup on unmount
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.close(); // Directly call close without .then()
        recognizerRef.current = null;
      }
      throttledTranscription.cancel(); // Cancel any pending throttled calls
    };
  }, [checkMicrophonePermission, initializeSpeechRecognizer, setupEventHandlers, throttledTranscription]);

  // Handle isListening prop changes
  useEffect(() => {
    if (isListening && !isSpeaking && !isInitializing) {
      startRecording();
    } else if (!isListening && isSpeaking) {
      stopRecording();
    }
  }, [isListening, isSpeaking, isInitializing, startRecording, stopRecording]);

  // This component doesn't render any UI elements
  return null;
};

export default SpeechRecognition;
