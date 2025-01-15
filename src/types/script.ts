// src/types/script.ts

export interface Word {
    text: string;
    startTime: number;
    endTime: number;
  }
  
  export interface ScriptLine {
    segmentId: string;
    type: 'prerecorded' | 'generated';
    words: Word[];
    startTime: number;
    endTime: number;
    isComplete: boolean;
  }