// src/utils/flowise.ts
import { config } from '../config/env';

interface FlowiseResponse {
  text: string;
  done: boolean;
}

export const processWithFlowise = async (
  input: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    const response = await fetch(
      `${config.flowise.baseUrl}/api/v1/prediction/${config.flowise.chatflowId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.flowise.apiKey}`,
        },
        body: JSON.stringify({
          question: input,
          streaming: false,
        }),
      }
    );

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      try {
        const parsedChunk: FlowiseResponse = JSON.parse(chunk);
        if (onChunk) {
          onChunk(parsedChunk.text);
        }
        finalResponse += parsedChunk.text;
      } catch (e) {
        console.error('Error parsing chunk:', e);
      }
    }

    return finalResponse;
  } catch (error) {
    console.error('Flowise processing error:', error);
    throw error;
  }
};