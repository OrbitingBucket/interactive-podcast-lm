// src/App.tsx

import React from 'react';
import { PodcastFlow } from './components/PodcastFlow';
import { PodcastProvider } from './store/PodcastContext';

function App() {
  return (
    <PodcastProvider>
      <div className="app min-h-screen bg-[#003456] flex flex-col items-center justify-center text-white">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mt-4">RadioArtelia</h1>
          <h2 className="text-2xl mt-2">Projets et genre</h2>
        </header>

        {/* Podcast Flow */}
        <PodcastFlow />
      </div>
    </PodcastProvider>
  );
}

export default App;
