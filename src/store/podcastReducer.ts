// src/store/podcastReducer.ts
import { PodcastState, PodcastPhase } from '../types/podcast';

export type PodcastAction =
  | { type: 'SET_PHASE'; payload: PodcastPhase }
  | { type: 'SET_SEGMENTS'; payload: PodcastSegment[] }
  | { type: 'SET_CURRENT_SEGMENT'; payload: number }
  | { type: 'SET_RECOGNITION_ACTIVE'; payload: boolean }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

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
    default:
      return state;
  }
}