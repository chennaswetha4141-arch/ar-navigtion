import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  Ban,
  Unlock,
  Layers,
  MapPin,
  GitCommit,
  CheckCircle,
} from 'lucide-react';
import { approvePathReport, rejectPathReport, togglePathBlockApi, resetDemoDataApi } from '../services/api';
import type { NavigationNode, NavigationPath, PathReport, Building } from '../types/campus';

interface AdminPanelProps {
  nodes: NavigationNode[];
  paths: NavigationPath[];
  reports: PathReport[];
  buildings: Building[];
  onDataChanged: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  nodes,
  paths,
  reports,
  buildings,
  onDataChanged,
  isAdmin,
  setIsAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'paths' | 'nodes'>('reports');
  const [adminKey, setAdminKey] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const blockedPaths = paths.filter((p) => p.isBlocked);
  const pendingReports = reports.filter((r) => r.status === 'PENDING');

  const handleApproveReport = async (reportId: number) => {
    try {
      await approvePathReport(reportId);
      setFeedback('Report approved. Obstruction applied to the campus graph.');
      setTimeout(() => setFeedback(null), 3000);
      onDataChanged();
    } catch {
      alert('Failed to approve report');
    }
  };

  const handleRejectReport = async (reportId: number) => {
    try {
      await rejectPathReport(reportId);
      setFeedback('Report rejected and marked as resolved.');
      setTimeout(() => setFeedback(null), 3000);
      onDataChanged();
    } catch {
      alert('Failed to reject report');
    }
  };

  const handleTogglePathBlock = async (pathId: number) => {
    try {
      const res = await togglePathBlockApi(pathId, 'Maintenance barrier toggled by Administrator');
      setFeedback(`Path #${pathId} is now ${res.path.isBlocked ? 'BLOCKED' : 'OPEN'}`);
      setTimeout(() => setFeedback(null), 3000);
      onDataChanged();
    } catch {
      alert('Failed to toggle path status');
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetDemoDataApi();
      setFeedback('Demo graph reset to pristine initial state.');
      setTimeout(() => setFeedback(null), 3000);
      onDataChanged();
    } catch {
      alert('Failed to reset demo data');
    }
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Admin Header with Role Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">CampusLens Administration Console</h1>
            <p className="text-xs text-slate-400">
              Manage live navigation graph, approve path obstruction reports, and test system failovers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isAdmin
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAdmin ? '🛡️ Admin Authenticated' : 'Click to Toggle Admin Mode'}
          </button>
          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset paths and reports to initial demo state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-xs font-semibold text-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Graph Overview Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Total Nodes in Graph</span>
          <span className="text-2xl font-bold text-white font-mono">{nodes.length}</span>
          <span className="text-[11px] text-slate-500">Classrooms, junctions, entrances</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Total Walkable Edges</span>
          <span className="text-2xl font-bold text-white font-mono">{paths.length}</span>
          <span className="text-[11px] text-slate-500">Paths, corridors, stairs</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Currently Blocked</span>
          <span className="text-2xl font-bold text-rose-400 font-mono">{blockedPaths.length}</span>
          <span className="text-[11px] text-rose-400/80">Active obstructions</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Pending User Reports</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">{pendingReports.length}</span>
          <span className="text-[11px] text-amber-400/80">Awaiting admin review</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'reports' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>User Path Reports ({reports.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'paths' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Manage Path Obstructions ({paths.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'nodes' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Campus Buildings & Nodes</span>
        </button>
      </div>

      {/* Tab 1: User Path Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
              No reports submitted yet.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200">{report.reporterName}</span>
                    <span>·</span>
                    <span className="uppercase text-amber-400 font-mono text-[11px]">{report.problemType}</span>
                    <span>·</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' :
                      report.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{report.locationName}</div>
                  <p className="text-xs text-slate-300 mt-1">{report.description}</p>
                </div>

                {report.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveReport(report.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Approve report and block corresponding path in routing engine"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Block</span>
                    </button>
                    <button
                      onClick={() => handleRejectReport(report.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Paths & Obstruction Toggling */}
      {activeTab === 'paths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paths.map((p) => {
            const s = nodeMap.get(p.sourceNodeId);
            const d = nodeMap.get(p.destinationNodeId);
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  p.isBlocked
                    ? 'bg-rose-950/30 border-rose-700/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-mono text-slate-400">
                    Path #{p.id} · {p.distance}m {p.isStairs ? '(Stairs)' : p.isElevator ? '(Elevator)' : '(Paved Walkway)'}
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {s?.name || `Node ${p.sourceNodeId}`} ↔ {d?.name || `Node ${p.destinationNodeId}`}
                  </div>
                  {p.isBlocked && (
                    <div className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{p.blockedReason || 'Path marked as blocked'}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleTogglePathBlock(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
                    p.isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                  }`}
                >
                  {p.isBlocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unblock</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block Path</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Buildings Directory */}
      {activeTab === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400 font-bold">{b.code}</span>
                <span className="capitalize">{b.category}</span>
              </div>
              <h3 className="text-base font-bold text-white">{b.name}</h3>
              <p className="text-xs text-slate-400">{b.description}</p>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                Open Hours: {b.openHours}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
