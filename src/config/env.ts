// src/config/env.ts
export const config = {
    azure: {
      key: import.meta.env.VITE_AZURE_COGNITIVE_KEY,
      region: import.meta.env.VITE_AZURE_COGNITIVE_REGION,
    },
    flowise: {
      baseUrl: import.meta.env.VITE_FLOWISE_BASE_URL,
      apiKey: import.meta.env.VITE_FLOWISE_API_KEY,
      chatflowId: import.meta.env.VITE_FLOWISE_CHATFLOW_ID_CHAIN1,
    },
    elevenlabs: {
      apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
    },
  };