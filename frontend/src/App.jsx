import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import DocsPage from './components/DocsPage';
import PricingPage from './components/PricingPage';
import WorkspacePage from './components/WorkspacePage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;