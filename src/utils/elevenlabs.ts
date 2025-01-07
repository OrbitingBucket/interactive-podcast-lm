// src/utils/elevenlabs.ts
import { ElevenLabsClient } from 'elevenlabs';
import { config } from '../config/env';

interface ElevenLabsOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

const DEFAULT_OPTIONS: Required<ElevenLabsOptions> = {
  voiceId: 'ufWL6S7fryuQBD3Y5J3I',
  modelId: 'eleven_flash_v2_5',
  stability: 0.5,
  similarityBoost: 0.75,
};

export const generateSpeech = async (
  text: string,
  options: ElevenLabsOptions = {}
): Promise<Blob> => {
  console.log('Starting ElevenLabs speech generation...');
  console.log('Input text length:', text.length);
  console.log('Input text preview:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

  try {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    
    console.log('Using ElevenLabs configuration:', {
      voiceId: mergedOptions.voiceId,
      modelId: mergedOptions.modelId,
      stability: mergedOptions.stability,
      similarityBoost: mergedOptions.similarityBoost
    });

    console.log('Initializing ElevenLabs client...');
    const client = new ElevenLabsClient({
      apiKey: config.elevenlabs.apiKey,
    });

    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${mergedOptions.voiceId}/stream`;
    console.log('Making request to ElevenLabs API:', apiUrl);

    const requestBody = {
      text,
      model_id: mergedOptions.modelId,
      voice_settings: {
        stability: mergedOptions.stability,
        similarity_boost: mergedOptions.similarityBoost,
      },
    };
    console.log('Request payload:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('ElevenLabs API response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('ElevenLabs API error response:', errorBody);
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    console.log('Successfully generated audio blob:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    // Verify the blob is valid
    if (audioBlob.size === 0) {
      throw new Error('Generated audio blob is empty');
    }

    return audioBlob;
  } catch (error) {
    console.error('Error in ElevenLabs generation:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};