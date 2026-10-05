import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { submitPathReport } from '../services/api';
import type { NavigationPath } from '../types/campus';

interface PathReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
  paths: NavigationPath[];
}

export const PathReportModal: React.FC<PathReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
  paths,
}) => {
  const [locationName, setLocationName] = useState('Central Plaza to CSE Main Walkway');
  const [problemType, setProblemType] = useState('construction');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState(
    'Pathway closed due to electrical trenching and paver repair. Barricades in place.'
  );
  const [reporterName, setReporterName] = useState('Swetha C. (Student)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName || !description) return;

    try {
      setIsSubmitting(true);
      await submitPathReport({
        pathId: 112, // Correlated to Central Plaza to CSE Walkway for demo
        locationName,
        problemType,
        severity,
        description,
        reporterName,
      });

      setSuccessMessage('Obstruction report submitted! Campus administrators will review and update navigation graphs.');
      setTimeout(() => {
        setSuccessMessage(null);
        onReportSubmitted();
        onClose();
      }, 1800);
    } catch (err: unknown) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Report Campus Path Obstruction</h2>
              <p className="text-xs text-slate-400">Help fellow students reroute around hazards or repairs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
            <div className="text-base font-bold text-white">Report Successfully Logged</div>
            <p className="text-xs text-slate-300 max-w-sm">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Obstruction Location / Walkway
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs"
                placeholder="e.g. Central Plaza to CSE Main Entrance"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Problem Type
                </label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs focus:outline-none"
                >
                  <option value="construction">Construction Work</option>
                  <option value="blocked_road">Blocked Road</option>
                  <option value="broken_pathway">Broken Pathway / Hazard</option>
                  <option value="closed_building">Closed Building / Gate</option>
                  <option value="temporary_restriction">Temporary Event Restriction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs focus:outline-none"
                >
                  <option value="LOW">Low (Partial Access)</option>
                  <option value="MEDIUM">Medium (Slowed Traffic)</option>
                  <option value="HIGH">High (Completely Blocked)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Detailed Description & Guidance
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs"
                placeholder="Explain the obstruction details..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Name & Affiliation
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs"
                placeholder="e.g. Swetha C. (Student / CS Dept)"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-950 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting...' : 'Submit Obstruction Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
