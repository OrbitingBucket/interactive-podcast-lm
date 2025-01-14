// src/components/Script.tsx

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { PodcastSegment } from '../types/podcast';
import { usePodcastContext } from '../store/PodcastContext';

interface ScriptProps {
  segment: PodcastSegment;
  liveTranscription?: string;
  currentTime: number; // Current playback time in seconds
  duration: number;    // Total duration of the audio in seconds
}

interface ScriptLine {
  segmentId: string;
  type: 'prerecorded' | 'generated';
  words: string[];
}

export const Script: React.FC<ScriptProps> = ({ segment, liveTranscription, currentTime, duration }) => {
  const { state } = usePodcastContext();
  
  // State to hold all script lines
  const [scriptLines, setScriptLines] = useState<ScriptLine[]>([]);
  
  // Ref for the sentinel element to auto-scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Effect to handle new segments
  useEffect(() => {
    // Add a new script line when a new segment starts
    setScriptLines(prevLines => [
      ...prevLines,
      {
        segmentId: segment.id,
        type: segment.type,
        words: [],
      }
    ]);
  }, [segment.id, segment.type]);
  
  // Split the script into words
  const words = useMemo(() => {
    if (segment.type === 'prerecorded') {
      return segment.script.split(' ');
    } else if (segment.type === 'generated') {
      return segment.text.split(' ');
    } else {
      return [];
    }
  }, [segment]);
  
  // Adjusted duration for word timing (real duration minus 1 second)
  const adjustedDuration = useMemo(() => {
    const adjustment = 1; // 1-second buffer
    const adjusted = duration - adjustment;
    return adjusted > 0 ? adjusted : duration; // If adjusted is not positive, use the real duration
  }, [duration]);
  
  // Calculate the time per word
  const timePerWord = useMemo(() => {
    return adjustedDuration / words.length;
  }, [adjustedDuration, words.length]);
  
  // Determine which words should be displayed based on currentTime
  const wordsToShow = useMemo(() => {
    if (timePerWord > 0) {
      const index = Math.min(Math.floor(currentTime / timePerWord), words.length);
      return words.slice(0, index);
    }
    return [];
  }, [currentTime, timePerWord, words]);
  
  // Effect to update the current script line with new words
  useEffect(() => {
    setScriptLines(prevLines => {
      if (prevLines.length === 0) return prevLines;
      
      const lastLine = prevLines[prevLines.length - 1];
      const newWordsCount = wordsToShow.length - lastLine.words.length;
      
      // If there are new words to add
      if (newWordsCount > 0) {
        const newWords = wordsToShow.slice(lastLine.words.length, lastLine.words.length + newWordsCount);
        
        const updatedLastLine: ScriptLine = {
          ...lastLine,
          words: [...lastLine.words, ...newWords],
        };
        
        return [...prevLines.slice(0, -1), updatedLastLine];
      }
      
      return prevLines;
    });
  }, [wordsToShow]);
  
  // Scroll to the bottom whenever scriptLines change
  useEffect(() => {
    if (sentinelRef.current) {
      sentinelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scriptLines]);
  
  return (
    // Outer Container with proper margins and padding
    <div className="script-container fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl bg-gray-800 bg-opacity-90 rounded-lg shadow-lg h-64 flex items-center justify-center overflow-y-auto scrollbar-style p-4">
      
      {/* Inner Rectangle */}
      {state.currentPhase === 'LISTENING' && liveTranscription ? (
        <div className="live-transcription bg-gray-700 rounded flex flex-col p-4 w-full h-full overflow-y-auto scrollbar-style">
          <h3 className="text-lg font-semibold text-white mb-2">
            Question en cours :
          </h3>
          <p className="text-gray-300 text-base overflow-auto whitespace-pre-wrap">
            {liveTranscription}
          </p>
        </div>
      ) : (
        <div
          className={`script bg-gray-700 rounded flex flex-col p-4 w-full h-full overflow-y-auto scrollbar-style`}
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            {segment.type === 'generated' ? 'Réponse :' : 'Script :'}
          </h3>
          
          {/* Display all script lines */}
          <div className="text-gray-300 text-base overflow-auto whitespace-pre-wrap">
            {scriptLines.map((line, lineIndex) => (
              <p key={`${line.segmentId}-${lineIndex}`} className="mb-2">
                {line.words.map((word, wordIndex) => {
                  const isCurrent = wordIndex === line.words.length - 1 && line === scriptLines[scriptLines.length - 1];
                  return (
                    <span
                      key={wordIndex}
                      className={`fade-in ${isCurrent ? 'current-word' : ''}`}
                      style={{ animationDelay: `${wordIndex * 0.02}s` }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
            {/* Sentinel Element */}
            <div ref={sentinelRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Script;
