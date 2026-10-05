import React from 'react';
import {
  Navigation,
  Compass,
  AlertTriangle,
  ArrowRight,
  Accessibility,
  Eye,
  Layers,
  MapPin,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { Facility } from '../types/campus';

interface LandingHeroProps {
  onStartNavigation: (destId?: number) => void;
  onExploreCampus: () => void;
  onOpenEmergency: () => void;
  facilities: Facility[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartNavigation,
  onExploreCampus,
  onOpenEmergency,
  facilities,
}) => {
  return (
    <div className="w-full flex flex-col gap-16 py-8 md:py-14 max-w-7xl mx-auto px-4 md:px-8">
      {/* Hero Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>Next-Generation College Hackathon Solution</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-display text-balance">
            Find your way. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Explore your campus.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            CampusLens is an intelligent, AR-assisted indoor and outdoor college navigation platform.
            Powered by Dijkstra shortest-path computation, automatic obstruction rerouting, and wheelchair-accessible routing, it guides students and visitors directly to classrooms, labs, and emergency stations.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartNavigation(14)} // Defaults to AI Lab
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 active:scale-95"
            >
              <Navigation className="w-4 h-4 text-slate-950" />
              <span>Start Navigation</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={onExploreCampus}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Interactive Map</span>
            </button>

            <button
              onClick={onOpenEmergency}
              className="px-5 py-3.5 bg-rose-950/80 hover:bg-rose-900/90 text-rose-200 font-bold text-sm rounded-xl border border-rose-800/80 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Emergency SOS</span>
            </button>
          </div>

          {/* Core Problem & Answer Kicker */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 animate-ping" />
            <div>
              <span className="font-semibold text-slate-200">The Problem Solved:</span>
              <p className="mt-0.5 text-slate-400 leading-normal">
                &ldquo;I am here at the Main Gate. I need to reach the AI Laboratory on Floor 1. What is the fastest, obstruction-free, barrier-free route?&rdquo; CampusLens computes it in milliseconds.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <img
              src="/src/assets/images/campuslens_hero_aerial_1791176750269.jpg"
              alt="CampusLens University Campus Aerial Overview"
              referrerPolicy="no-referrer"
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Floating AR Hologram Card */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-slate-950/90 backdrop-blur-md rounded-xl border border-cyan-500/30 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Eye className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono text-cyan-400">AR SPATIAL OVERLAY ACTIVE</div>
                  <div className="text-sm font-bold text-white">AI & ML Research Lab (CSE 101)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">ETA</div>
                <div className="text-sm font-bold text-emerald-400">~5 mins</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pillar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white font-display">Dijkstra Shortest Path</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Graph traversal algorithm evaluates distance weights, indoor stairs, and elevation shifts to determine the optimal step sequence.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white font-display">AR Visual Navigation</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Holographic directional arrows and live camera overlay project direction directly on campus walkways with zero lag.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white font-display">Multi-Floor Indoor Wayfinding</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seamless transition from outdoor quads to building ground floor atriums, central stairwells, elevators, and room doors.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Accessibility className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white font-display">Obstruction & ADA Routing</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time rerouting around construction barriers, plus barrier-free modes avoiding stairs for wheelchair users.
          </p>
        </div>
      </div>

      {/* Quick Navigation Destination Highlights */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Featured Campus Destinations</h2>
            <p className="text-xs text-slate-400">Select any spot to instantly preview route computation</p>
          </div>
          <button
            onClick={() => onStartNavigation()}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All ({facilities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.slice(0, 6).map((fac) => (
            <div
              key={fac.id}
              onClick={() => onStartNavigation(fac.nodeId)}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{fac.department}</span>
                  <span className="font-mono text-cyan-400">Floor {fac.floor}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {fac.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{fac.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{fac.buildingName}</span>
                </span>
                <span className="font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Route</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
