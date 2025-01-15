// src/utils/scriptUtils.ts

import { Word } from '../types/script';

export const calculateWordTimings = (
  text: string,
  startTime: number,
  duration: number
): Word[] => {
  const words = text.split(' ');
  const timePerWord = duration / words.length;
  
  return words.map((word, index) => ({
    text: word,
    startTime: startTime + (index * timePerWord),
    endTime: startTime + ((index + 1) * timePerWord)
  }));
};

export const getVisibleWords = (words: Word[], currentTime: number): Word[] => {
  return words.filter(word => currentTime >= word.startTime);
};