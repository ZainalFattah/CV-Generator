import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const ChatCV = lazy(() => import('./pages/ChatCV'));
const RoastCV = lazy(() => import('./pages/RoastCV'));

function App() {
  return (
    <Router>
      <div className="flex flex-col bg-bg text-text font-body retro-crt" style={{ height: '100dvh', maxHeight: '100dvh' }}>
        <Navbar />
        <main className="flex-1 relative z-10 flex flex-col min-h-0 overflow-hidden">
          <Suspense fallback={<div className="flex justify-center items-center h-full text-accent blink">LOADING...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/chat" element={<ChatCV />} />
              <Route path="/roast" element={<RoastCV />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
