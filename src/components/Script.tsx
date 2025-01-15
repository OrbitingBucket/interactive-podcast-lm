// src/components/Script.tsx

import React, { useEffect, useRef, useState } from 'react';
import { PodcastSegment } from '../types/podcast';

interface ScriptProps {
  segment: PodcastSegment;
  liveTranscription?: string;
  currentTime: number;
  duration: number;
}

interface ScriptEntry {
  id: string;
  text: string;
  type: 'prerecorded' | 'generated';
  speaker?: string;
}

const Script: React.FC<ScriptProps> = ({ 
  segment, 
  liveTranscription, 
  currentTime, 
  duration 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [scriptHistory, setScriptHistory] = useState<ScriptEntry[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLineRef = useRef<HTMLParagraphElement>(null);
  const currentSegmentRef = useRef<string>('');

  // Helper function to get speaker label
  const getSpeakerLabel = (segment: PodcastSegment): string => {
    if (segment.type === 'prerecorded') {
      switch (segment.host) {
        case 'Host1':
          return 'Hôte';
        case 'Host2':
          return 'Intervenante';
        default:
          return 'Hôte';
      }
    }
    return 'Auditeur';
  };

  // Split text into words when segment changes
  useEffect(() => {
    // Skip if this segment is already being processed
    if (currentSegmentRef.current === segment.id) return;
    
    console.log('Script: New segment detected', { 
      id: segment.id, 
      type: segment.type 
    });

    currentSegmentRef.current = segment.id;
    
    const text = segment.type === 'prerecorded' 
      ? segment.script 
      : segment.text || '';
      
    const newWords = text.split(/\s+/);
    setWords(newWords);
    
    // Add new segment to history with speaker information
    // Only add to history if it's a new segment
    setScriptHistory(prev => {
      // Check if this segment is already in history
      if (!prev.find(entry => entry.id === segment.id)) {
        return [...prev, {
          id: segment.id,
          text: '',
          type: segment.type,
          speaker: getSpeakerLabel(segment)
        }];
      }
      return prev;
    });
    
    console.log('Script: Prepared words for rendering', { 
      wordCount: newWords.length 
    });
  }, [segment]);

  // Handle live transcription updates
  useEffect(() => {
    if (liveTranscription) {
      console.log('Script: Updating live transcription');
      setDisplayedText(liveTranscription);
      
      // Update the last entry in history if it's the current segment
      setScriptHistory(prev => {
        const newHistory = [...prev];
        const lastEntry = newHistory[newHistory.length - 1];
        
        if (lastEntry && lastEntry.id === currentSegmentRef.current) {
          newHistory[newHistory.length - 1] = {
            ...lastEntry,
            text: liveTranscription,
            type: 'generated',
            speaker: 'Auditeur'
          };
        }
        return newHistory;
      });
    }
  }, [liveTranscription]);

  // Progressive text rendering based on timing
  useEffect(() => {
    if (duration === 0 || words.length === 0) return;

    const wordsPerSecond = words.length / duration;
    const wordIndex = Math.floor(currentTime * wordsPerSecond);
    
    const visibleWords = words.slice(0, Math.min(wordIndex + 1, words.length));
    const newText = visibleWords.join(' ');
    setDisplayedText(newText);

    // Update only the current segment's text in history
    setScriptHistory(prev => {
      const newHistory = [...prev];
      const lastEntry = newHistory[newHistory.length - 1];
      
      if (lastEntry && lastEntry.id === currentSegmentRef.current) {
        newHistory[newHistory.length - 1] = {
          ...lastEntry,
          text: newText
        };
      }
      return newHistory;
    });
  }, [currentTime, duration, words]);

  // Auto-scroll to last line
  useEffect(() => {
    if (lastLineRef.current) {
      lastLineRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
  }, [displayedText]);

  // Get text color based on speaker type
  const getTextColorClass = (entry: ScriptEntry): string => {
    console.log('Determining color for entry:', { 
      type: entry.type, 
      speaker: entry.speaker 
    });
    return entry.type === 'prerecorded' ? 'text-blue-200' : 'text-green-200';
  };

  return (
    <div className="script-container fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl bg-gray-800 bg-opacity-90 rounded-lg shadow-lg h-64 flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="script bg-gray-700 rounded flex flex-col p-4 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700"
      >
        {scriptHistory.map((entry, index) => (
          <div key={entry.id} className="mb-4">
            <div className="text-xs text-gray-400 mb-2">
              {entry.speaker}
            </div>
            <p 
              ref={index === scriptHistory.length - 1 ? lastLineRef : undefined}
              className={`leading-relaxed ${getTextColorClass(entry)}`}
            >
              {entry.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Script;