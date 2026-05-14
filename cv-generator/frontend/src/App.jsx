import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChatCV from './pages/ChatCV';
import Preview from './pages/Preview';
import RoastCV from './pages/RoastCV';
import JobMatch from './pages/JobMatch';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg text-text font-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatCV />} />
          <Route path="/preview/:id" element={<Preview />} />
          <Route path="/roast" element={<RoastCV />} />
          <Route path="/jobmatch" element={<JobMatch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
