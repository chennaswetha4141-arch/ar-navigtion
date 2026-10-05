import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Play,
  CheckCircle,
  AlertTriangle,
  Eye,
  Accessibility,
  Activity,
  Compass,
  ArrowRight,
  Shield,
  RotateCcw,
} from 'lucide-react';

interface HackathonDemoBarProps {
  isOpen: boolean;
  onClose: () => void;
  onDemoAction: (actionKey: string) => void;
}

export const HackathonDemoBar: React.FC<HackathonDemoBarProps> = ({
  isOpen,
  onClose,
  onDemoAction,
}) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const judgeScenarios = [
    {
      step: 1,
      title: 'Find AI & ML Lab (CSE 101)',
      desc: 'Routes from Main Gate across Quad and Atrium to 1st Floor AI Lab via Dijkstra.',
      actionKey: 'find_ai_lab',
      badge: 'Indoor & Outdoor',
    },
    {
      step: 2,
      title: 'Enable Accessible Route (ADA Mode)',
      desc: 'Avoids Central Stairs; redirects to ADA certified elevator to reach Floor 1.',
      actionKey: 'accessible_route',
      badge: 'Wheelchair Mode',
    },
    {
      step: 3,
      title: 'Simulate Path Block & Auto-Reroute',
      desc: 'Marks Main Central Plaza to CSE walkway as blocked; algorithm automatically finds East Quad detour.',
      actionKey: 'block_path',
      badge: 'Dynamic Reroute',
    },
    {
      step: 4,
      title: 'Launch AR Visual Navigation',
      desc: 'Opens full holographic AR HUD with 3D turn arrows, distance readout & camera simulation.',
      actionKey: 'start_ar',
      badge: 'AR Prototype',
    },
    {
      step: 5,
      title: 'Emergency Medical Triage SOS',
      desc: 'Instant 1-click rescue routing to nearest Campus Health Center triage room.',
      actionKey: 'emergency_medical',
      badge: 'Emergency SOS',
    },
    {
      step: 6,
      title: 'Navigate to Central Library',
      desc: 'Calculates path to 1st Floor quiet study hall with book return kiosk landmark.',
      actionKey: 'find_library',
      badge: 'Multi-Floor',
    },
    {
      step: 7,
      title: 'Reset Demo State to Initial',
      desc: 'Clears blocked paths and restores pristine graph topology.',
      actionKey: 'reset_demo',
      badge: 'Reset Graph',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 rounded-2xl border border-cyan-500/50 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-display">Hackathon Judge Control Panel</h2>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  DEMO MODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1-click triggers for all 14 stages of the judging evaluation flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Scenarios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {judgeScenarios.map((sc) => (
            <div
              key={sc.step}
              onClick={() => {
                setActiveStep(sc.step);
                onDemoAction(sc.actionKey);
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-cyan-400 font-bold">STAGE 0{sc.step}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {sc.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {sc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">Run Scenario</span>
                <span className="p-1.5 rounded-lg bg-cyan-600 group-hover:bg-cyan-500 text-white font-bold transition-transform group-hover:translate-x-1">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Full Dijkstra engine, live REST APIs, obstacle rerouting & AR layer active.</span>
          </span>
          <button
            onClick={() => {
              onDemoAction('reset_demo');
              onClose();
            }}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
