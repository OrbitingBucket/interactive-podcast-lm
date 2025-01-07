// src/utils/elevenlabs.ts
import { config } from '../config/env';

interface ElevenLabsOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

const DEFAULT_OPTIONS: ElevenLabsOptions = {
  voiceId: 'JBFqnCBsd6RMkjVDRZzb',
  modelId: 'eleven_flash_v2_5',
  stability: 0.5,
  similarityBoost: 0.75,
};

export const generateSpeech = async (
  text: string,
  options: ElevenLabsOptions = DEFAULT_OPTIONS
): Promise<MediaStream> => {
  try {
    console.log('Generating speech with ElevenLabs:', { text, options });

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${options.voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: options.modelId,
          voice_settings: {
            stability: options.stability,
            similarity_boost: options.similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    // Get the audio data as a blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create an audio element and media source
    const audio = new Audio(audioUrl);
    await new Promise((resolve) => {
      audio.addEventListener('loadeddata', resolve, { once: true });
    });

    // Create a media stream from the audio element
    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);

    // Start playing
    audio.play();

    console.log('Speech stream generated successfully');
    return destination.stream;

  } catch (error) {
    console.error('ElevenLabs generation error:', error);
    throw error;
  }
};