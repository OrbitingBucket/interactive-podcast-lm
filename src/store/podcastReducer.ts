// src/store/podcastReducer.ts

import { PodcastState, PodcastPhase, PodcastSegment } from '../types/podcast';

export type PodcastAction =
  | { type: 'SET_PHASE'; payload: PodcastPhase }
  | { type: 'SET_SEGMENTS'; payload: PodcastSegment[] }
  | { type: 'SET_CURRENT_SEGMENT'; payload: number }
  | { type: 'SET_RECOGNITION_ACTIVE'; payload: boolean }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  // New actions
  | { type: 'UPDATE_CURRENT_TIME'; payload: number }
  | { 
      type: 'UPDATE_SEGMENT_TIMING'; 
      payload: { 
        startTime: number; 
        duration: number; 
      } 
    }
  | { type: 'MARK_SEGMENT_COMPLETE' }
  | { type: 'RESET_SEGMENT_TIMING' };

export function podcastReducer(state: PodcastState, action: PodcastAction): PodcastState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, currentPhase: action.payload };
    
    case 'SET_SEGMENTS':
      return { ...state, segments: action.payload };
    
    case 'SET_CURRENT_SEGMENT':
      return { ...state, currentSegmentIndex: action.payload };
    
    case 'SET_RECOGNITION_ACTIVE':
      return {
        ...state,
        recognition: { ...state.recognition, isActive: action.payload }
      };
    
    case 'SET_TRANSCRIPT':
      return {
        ...state,
        recognition: { ...state.recognition, transcript: action.payload }
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    // New cases for timing
    case 'UPDATE_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload
      };

    case 'UPDATE_SEGMENT_TIMING':
      return {
        ...state,
        segmentTiming: {
          startTime: action.payload.startTime,
          duration: action.payload.duration,
          isComplete: false
        }
      };

    case 'MARK_SEGMENT_COMPLETE':
      return {
        ...state,
        segmentTiming: {
          ...state.segmentTiming,
          isComplete: true
        }
      };

    case 'RESET_SEGMENT_TIMING':
      return {
        ...state,
        segmentTiming: {
          startTime: 0,
          duration: 0,
          isComplete: false
        }
      };

    default:
      return state;
  }
}