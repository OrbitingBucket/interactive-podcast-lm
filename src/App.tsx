// src/App.tsx

import React from 'react';
import { PodcastFlow } from './components/PodcastFlow';
import { preRecordedSegments } from './data/segments';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <PodcastFlow preRecordedSegments={preRecordedSegments} />
      </div>
    </div>
  );
}

export default App;
