// src/store/PodcastContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { PodcastState } from '../types/podcast';
import { podcastReducer } from './podcastReducer';

const initialState: PodcastState = {
  currentPhase: 'INITIAL',
  segments: [],
  currentSegmentIndex: 0,
  recognition: {
    isActive: false,
    transcript: '',
  },
  flowise: {
    isProcessing: false,
    chunks: [],
  },
  tts: {
    isGenerating: false,
    isPlaying: false,
  },
  error: null,
};

const PodcastContext = createContext<{
  state: PodcastState;
  dispatch: React.Dispatch<PodcastAction>;
} | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(podcastReducer, initialState);

  return (
    <PodcastContext.Provider value={{ state, dispatch }}>
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcastContext = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcastContext must be used within a PodcastProvider');
  }
  return context;
};