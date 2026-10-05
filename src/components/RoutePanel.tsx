import React from 'react';
import {
  Navigation,
  Clock,
  Accessibility,
  AlertTriangle,
  Eye,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  Layers,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import type { RouteResult, TurnInstruction } from '../types/campus';

interface RoutePanelProps {
  routeResult: RouteResult | null;
  isLoading: boolean;
  error: string | null;
  accessibleOnly: boolean;
  onToggleAccessible: (val: boolean) => void;
  onStartAR: () => void;
  onSimulatePathBlock?: () => void;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  routeResult,
  isLoading,
  error,
  accessibleOnly,
  onToggleAccessible,
  onStartAR,
  onSimulatePathBlock,
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-8 bg-slate-900/80 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-bold text-slate-200">Computing Dijkstra Shortest Route...</div>
        <div className="text-xs text-slate-400">Evaluating weighted graph nodes, floor transfers & accessibility bounds</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-rose-950/40 rounded-2xl border border-rose-800/80 text-rose-200 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-rose-300">Route Calculation Notice</h3>
          <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!routeResult) {
    return (
      <div className="w-full p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-center text-slate-400">
        <Navigation className="w-8 h-8 text-cyan-500/60 mx-auto mb-2" />
        <div className="text-sm font-bold text-slate-300">No Active Route Selected</div>
        <p className="text-xs text-slate-500 mt-1">Select a destination from the map or directory to preview turn-by-turn guidance.</p>
      </div>
    );
  }

  const renderInstructionIcon = (action: TurnInstruction['action']) => {
    switch (action) {
      case 'turn_left':
      case 'slight_left':
        return <CornerUpLeft className="w-4 h-4 text-cyan-400" />;
      case 'turn_right':
      case 'slight_right':
        return <CornerUpRight className="w-4 h-4 text-cyan-400" />;
      case 'stairs_up':
      case 'stairs_down':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'elevator':
        return <ArrowUp className="w-4 h-4 text-teal-400" />;
      case 'arrive':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <ArrowUp className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-5 flex flex-col gap-5 shadow-xl">
      {/* Route Metrics Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs text-slate-400">Total Distance & Walk Time</div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-black text-white font-display">
              {routeResult.distance} m
            </span>
            <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{routeResult.estimatedTime} min walk
            </span>
          </div>
        </div>

        {/* Action button: Start AR */}
        <button
          onClick={onStartAR}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <Eye className="w-4 h-4 stroke-[2.5]" />
          <span>Start AR Navigation</span>
        </button>
      </div>

      {/* Accessible Route Toggle & Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${accessibleOnly ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <Accessibility className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-200">Wheelchair / Barrier-Free Mode</div>
            <div className="text-slate-400 text-[11px]">
              {accessibleOnly
                ? 'Stairs bypassed. Prioritizing ramps and elevators.'
                : 'Standard walking path (includes stairs if shorter).'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleAccessible(!accessibleOnly)}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
            accessibleOnly
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {accessibleOnly ? 'Accessible Mode ON' : 'Enable Accessible'}
        </button>
      </div>

      {/* Obstruction / Auto-Reroute Alert */}
      {routeResult.isRerouted && (
        <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-600/70 text-xs text-amber-200 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Path Obstruction Avoided — Dynamic Reroute Applied</span>
          </div>
          <p className="text-amber-200/80 leading-relaxed pl-6">
            {routeResult.rerouteReason}
          </p>
        </div>
      )}

      {/* Turn-by-Turn Instruction Sequence */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Turn-by-Turn Step Guidance ({routeResult.instructions.length} steps)</span>
          {onSimulatePathBlock && (
            <button
              onClick={onSimulatePathBlock}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
            >
              <span>Simulate Blockage</span>
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {routeResult.instructions.map((inst, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-slate-800/80 shrink-0 mt-0.5">
                {renderInstructionIcon(inst.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200 leading-snug">
                  {inst.text}
                </div>
                {inst.landmark && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {inst.landmark}
                  </div>
                )}
              </div>
              {inst.distanceMeters > 0 && (
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs text-cyan-400">
                    {Math.round(inst.distanceMeters)}m
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
