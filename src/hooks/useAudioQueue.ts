// src/hooks/useAudioQueue.ts
import { useCallback, useRef } from 'react';
import { PodcastSegment } from '../types/podcast';
import { usePodcastContext } from '../store/PodcastContext';

export const useAudioQueue = () => {
  const { state, dispatch } = usePodcastContext();
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playNext = useCallback(async () => {
    const nextIndex = state.currentSegmentIndex + 1;
    if (nextIndex < state.segments.length) {
      dispatch({ type: 'SET_CURRENT_SEGMENT', payload: nextIndex });
    }
  }, [state.currentSegmentIndex, state.segments.length]);

  const waitForCurrentSegment = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (currentAudioRef.current) {
        currentAudioRef.current.addEventListener('ended', () => resolve(), { once: true });
      } else {
        resolve();
      }
    });
  }, []);

  return {
    currentAudioRef,
    playNext,
    waitForCurrentSegment,
  };
};