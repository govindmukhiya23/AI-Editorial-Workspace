import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Research from './pages/Research';
import ResearchDetails from './pages/ResearchDetails';
import Writing from './pages/Writing';
import Newsletter from './pages/Newsletter';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Fixed Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Route Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/research" element={<Research />} />
            <Route path="/research/:id" element={<ResearchDetails />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
