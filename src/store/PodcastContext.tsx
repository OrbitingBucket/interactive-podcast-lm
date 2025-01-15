// src/store/PodcastContext.tsx

import React, { createContext, useContext, useReducer } from 'react';
import { PodcastState, PodcastAction } from '../types/podcast';
import { podcastReducer } from './podcastReducer';

const initialState: PodcastState = {
  currentPhase: 'INITIAL',
  segments: [],
  currentSegmentIndex: 0,
  currentTime: 0,
  segmentTiming: {
    startTime: 0,
    duration: 0,
    isComplete: false
  },
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

interface PodcastContextType {
  state: PodcastState;
  dispatch: React.Dispatch<PodcastAction>;
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
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

// Helper hooks for timing-related operations
export const useSegmentTiming = () => {
  const { state, dispatch } = usePodcastContext();

  const updateSegmentTiming = (startTime: number, duration: number) => {
    dispatch({
      type: 'UPDATE_SEGMENT_TIMING',
      payload: {
        startTime,
        duration,
      },
    });
  };

  const markSegmentComplete = () => {
    dispatch({
      type: 'MARK_SEGMENT_COMPLETE',
    });
  };

  const updateCurrentTime = (time: number) => {
    dispatch({
      type: 'UPDATE_CURRENT_TIME',
      payload: time,
    });
  };

  return {
    timing: state.segmentTiming,
    currentTime: state.currentTime,
    updateSegmentTiming,
    markSegmentComplete,
    updateCurrentTime,
  };
};