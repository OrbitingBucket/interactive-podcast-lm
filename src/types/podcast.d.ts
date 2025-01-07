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
  audioStream?: Blob;
}

export type PodcastSegment = PreRecordedSegment | GeneratedSegment;

export interface PodcastState {
  currentPhase: PodcastPhase;
  segments: PodcastSegment[];
  currentSegmentIndex: number;
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