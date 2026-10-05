import React from 'react';
import { Compass, AlertTriangle, Shield, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'landing' | 'map' | 'search' | 'admin';
  setActiveTab: (tab: 'landing' | 'map' | 'search' | 'admin') => void;
  onOpenEmergency: () => void;
  onOpenReport: () => void;
  onOpenDemo: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  blockedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergency,
  onOpenReport,
  onOpenDemo,
  isAdmin,
  setIsAdmin,
  blockedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-sm shadow-cyan-500/20 text-slate-950 font-bold group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-display text-lg font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              CampusLens
            </span>
          </div>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('landing')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'landing' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'map' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400' : ''
            }`}
          >
            Campus Map
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'search' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400' : ''
            }`}
          >
            Directory & Search
          </button>
          <button
            onClick={onOpenReport}
            className="transition-colors hover:text-amber-400 flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Report Obstruction</span>
            {blockedCount > 0 && (
              <span className="text-xs text-amber-400 font-mono">({blockedCount})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`transition-colors hover:text-white flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'admin' ? 'text-cyan-400 font-semibold underline underline-offset-8 decoration-cyan-400' : ''
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 border border-cyan-700/50 rounded-lg hover:bg-cyan-900/60 hover:border-cyan-500 transition-colors shadow-sm whitespace-nowrap"
            title="Open Judge Hackathon Demonstration Controls"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Judge Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm shadow-rose-900/40 whitespace-nowrap active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
