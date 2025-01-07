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
  voiceId: '9BWtsMINqrJLrRacOk9x',
  modelId: 'eleven_flash_v2_5',
  stability: 0.5,
  similarityBoost: 0.75,
};

export const generateSpeech = async (
  text: string,
  options: ElevenLabsOptions = {}
): Promise<Blob> => {
  try {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    console.log('Generating speech with ElevenLabs:', { text, options: mergedOptions });

    const client = new ElevenLabsClient({
      apiKey: config.elevenlabs.apiKey,
    });

    // Use the REST API directly
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${mergedOptions.voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: mergedOptions.modelId,
          voice_settings: {
            stability: mergedOptions.stability,
            similarity_boost: mergedOptions.similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return await response.blob();

  } catch (error) {
    console.error('ElevenLabs generation error:', error);
    throw error;
  }
};