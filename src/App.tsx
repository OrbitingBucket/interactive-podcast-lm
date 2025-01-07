// src/App.tsx

import React from 'react';
import { PodcastFlow } from './components/PodcastFlow';
import { PodcastProvider } from './store/PodcastContext';

function App() {
  return (
    <PodcastProvider>
      <div className="app min-h-screen bg-gray-50">
        <PodcastFlow />
      </div>
    </PodcastProvider>
  );
}

export default App;