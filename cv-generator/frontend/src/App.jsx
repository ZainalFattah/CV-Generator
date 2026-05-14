import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const ChatCV = lazy(() => import('./pages/ChatCV'));
const RoastCV = lazy(() => import('./pages/RoastCV'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg text-text font-body retro-crt">
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-accent blink">LOADING...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatCV />} />
            <Route path="/roast" element={<RoastCV />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
