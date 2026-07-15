import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initAudio } from './lib/audio';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize the audio system after React has mounted.
// This registers the first-interaction listeners that will lazy-create
// the AudioContext when the user first clicks/taps — satisfying browser
// autoplay policy without blocking the render.
initAudio();
