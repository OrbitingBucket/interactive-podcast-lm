// src/components/TestAudio.tsx
import React, { useState, useRef } from 'react';
import { generateSpeech } from '../utils/elevenlabs';

export const TestAudio: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerateAndPlay = async () => {
    setIsLoading(true);
    setError(null);
    
    // Clean up previous audio URL if it exists
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    const text = "This is a test. If you can hear this, the TTS is working correctly.";

    try {
      const audioBlob = await generateSpeech(text);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Play the audio automatically when it's loaded
      if (audioRef.current) {
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        
        // Handle play() promise to avoid potential errors
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio started playing automatically');
            })
            .catch(error => {
              console.error('Autoplay was prevented:', error);
              setError('Autoplay was prevented. Please click play manually.');
            });
        }
      }
    } catch (err) {
      console.error('Error generating or playing speech:', err);
      setError('Failed to generate or play speech. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="test-audio-container p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">TTS Audio Test</h2>
      <button
        onClick={handleGenerateAndPlay}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate and Play TTS'}
      </button>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {audioUrl && (
        <audio 
          ref={audioRef}
          controls 
          src={audioUrl} 
          autoPlay // Add autoPlay attribute
          className="w-full"
        >
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};