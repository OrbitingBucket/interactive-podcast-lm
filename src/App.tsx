// src/App.tsx

import React from 'react';
import { PodcastFlow } from './components/PodcastFlow';
import { PodcastProvider } from './store/PodcastContext';

function App() {
  return (
    <PodcastProvider>
      <div className="app w-full max-w-2xl min-h-screen bg-[#003456] flex flex-col items-center justify-center text-white mx-auto px-4">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mt-8">RadioArtelia</h1>
          <h2 className="text-2xl mt-2">Projets et genre</h2>
        </header>

        {/* Podcast Flow */}
        <PodcastFlow />
      </div>
    </PodcastProvider>
  );
}

export default App;
