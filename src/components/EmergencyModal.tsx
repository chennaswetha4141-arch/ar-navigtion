import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  PhoneCall,
  Activity,
  Shield,
  LifeBuoy,
  DoorOpen,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import type { EmergencyLocation } from '../types/campus';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmergency: (emergencyType?: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onSelectEmergency,
}) => {
  if (!isOpen) return null;

  const emergencyOptions = [
    {
      type: 'medical',
      title: 'Medical Room & Triage Station',
      subtitle: 'Doctor on duty, ambulance standby & trauma kit',
      phone: '+1 (800) 555-0911',
      icon: Activity,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    },
    {
      type: 'security',
      title: 'Campus Security Headquarters',
      subtitle: 'Central dispatch, mobile patrol & ID verification',
      phone: '+1 (800) 555-0999',
      icon: Shield,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
    {
      type: 'police',
      title: 'Police & Security SOS Help Point',
      subtitle: 'Two-way audio pillar connected to campus vigilance',
      phone: 'Press SOS Button',
      icon: LifeBuoy,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      type: 'exit',
      title: 'North Perimeter Emergency Evacuation Gate',
      subtitle: 'Wide fire escape gate leading to public muster point',
      phone: 'Fire Marshal Station',
      icon: DoorOpen,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-950 rounded-2xl border border-rose-700/80 shadow-2xl p-6 flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-display">Campus Emergency Dispatch</h2>
              <p className="text-xs text-rose-300/80">Immediate evacuation and first-responder navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Selection Cards */}
        <div className="grid grid-cols-1 gap-3">
          {emergencyOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.type}
                onClick={() => {
                  onSelectEmergency(opt.type);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${opt.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.subtitle}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 mt-1">
                      <PhoneCall className="w-3 h-3" />
                      <span>{opt.phone}</span>
                    </div>
                  </div>
                </div>

                <button className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 group-hover:scale-105 transition-transform shadow-md shadow-rose-950">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Notice */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>In critical life safety situations, call campus hotline immediately:</span>
          <span className="font-mono font-bold text-rose-400">911 / (800) 555-0911</span>
        </div>
      </div>
    </div>
  );
};
