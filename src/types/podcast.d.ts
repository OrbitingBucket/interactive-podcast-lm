// src/types/podcast.d.ts

export type SegmentType = "prerecorded" | "dynamic";

export interface PreRecordedSegment {
  id: string;
  type: "prerecorded";
  host: "Host1" | "Host2";
  audioFile: string;
  script: string;
}

export interface DynamicSegment {
  id: string;
  type: "dynamic";
  host: "Host1" | "Host2";
  text: string;
  audioSrc?: string;
}

export type PodcastSegment = PreRecordedSegment | DynamicSegment;