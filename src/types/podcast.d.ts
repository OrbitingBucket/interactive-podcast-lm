// src/types/podcast.ts

export type PodcastPhase = 
  | 'INITIAL'
  | 'PLAYING'
  | 'INVITATION'
  | 'LISTENING'
  | 'PROCESSING'
  | 'ANSWERING';

export interface PreRecordedSegment {
  id: string;
  type: 'prerecorded';
  host: string;
  audioFile: string;
  script: string;
}

export interface GeneratedSegment {
  id: string;
  type: 'generated';
  text: string;
  audioSrc?: string;
  audioStream?: ReadableStream<Uint8Array>;
}

export type PodcastSegment = PreRecordedSegment | GeneratedSegment;

export interface SegmentTiming {
  startTime: number;
  duration: number;
  isComplete: boolean;
}

export interface PodcastState {
  currentPhase: PodcastPhase;
  segments: PodcastSegment[];
  currentSegmentIndex: number;
  currentTime: number;  // Added
  segmentTiming: SegmentTiming;  // Added
  recognition: {
    isActive: boolean;
    transcript: string;
  };
  flowise: {
    isProcessing: boolean;
    chunks: string[];
  };
  tts: {
    isGenerating: boolean;
    isPlaying: boolean;
  };
  error: string | null;
}