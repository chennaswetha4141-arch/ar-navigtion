import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { CampusMap } from './components/CampusMap';
import { DestinationSearch } from './components/DestinationSearch';
import { RoutePanel } from './components/RoutePanel';
import { ARView } from './components/ARView';
import { EmergencyModal } from './components/EmergencyModal';
import { PathReportModal } from './components/PathReportModal';
import { AdminPanel } from './components/AdminPanel';
import { HackathonDemoBar } from './components/HackathonDemoBar';
import {
  fetchBuildings,
  fetchFacilities,
  fetchNodes,
  fetchPaths,
  fetchPathReports,
  calculateRouteApi,
  calculateEmergencyRouteApi,
  togglePathBlockApi,
  resetDemoDataApi,
} from './services/api';
import type {
  Building,
  Facility,
  NavigationNode,
  NavigationPath,
  PathReport,
  RouteResult,
} from './types/campus';
import {
  Compass,
  Navigation,
  Sparkles,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Eye,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'map' | 'search' | 'admin'>('landing');

  // Campus Data State
  const [nodes, setNodes] = useState<NavigationNode[]>([]);
  const [paths, setPaths] = useState<NavigationPath[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [reports, setReports] = useState<PathReport[]>([]);

  // Navigation State
  const [selectedSourceId, setSelectedSourceId] = useState<number>(1); // Default: Main Campus Gate
  const [selectedDestId, setSelectedDestId] = useState<number>(14); // Default: AI & ML Lab
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Modals & Panels
  const [isAROpen, setIsAROpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Toast Banner for Judge Actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initial Data Fetching
  const loadCampusData = useCallback(async () => {
    try {
      const [nodesData, pathsData, facilitiesData, buildingsData, reportsData] = await Promise.all([
        fetchNodes(),
        fetchPaths(),
        fetchFacilities(),
        fetchBuildings(),
        fetchPathReports(),
      ]);
      setNodes(nodesData);
      setPaths(pathsData);
      setFacilities(facilitiesData);
      setBuildings(buildingsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load campus graph data:', err);
    }
  }, []);

  useEffect(() => {
    loadCampusData();
  }, [loadCampusData]);

  // 2. Route Recalculation Handler
  const computeRoute = useCallback(
    async (sourceId: number, destId: number, accessible: boolean) => {
      if (!sourceId || !destId) return;
      try {
        setIsLoadingRoute(true);
        setRouteError(null);
        const result = await calculateRouteApi(sourceId, destId, accessible);
        setRouteResult(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'No route available';
        setRouteError(msg);
        setRouteResult(null);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    []
  );

  // Auto compute route when source, dest or accessibility changes
  useEffect(() => {
    if (nodes.length > 0 && selectedSourceId && selectedDestId) {
      computeRoute(selectedSourceId, selectedDestId, accessibleOnly);
    }
  }, [selectedSourceId, selectedDestId, accessibleOnly, nodes.length, computeRoute]);

  const targetFacility = useMemo(() => {
    return facilities.find((f) => f.nodeId === selectedDestId);
  }, [facilities, selectedDestId]);

  const destinationNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedDestId);
  }, [nodes, selectedDestId]);

  // 3. Selection Handlers
  const handleSelectDestination = (nodeId: number, triggerAR = false) => {
    setSelectedDestId(nodeId);
    setActiveTab('map');
    if (triggerAR) {
      setTimeout(() => setIsAROpen(true), 350);
    }
  };

  // 4. Emergency Route Trigger
  const handleSelectEmergency = async (emergencyType?: string) => {
    try {
      setIsLoadingRoute(true);
      setRouteError(null);
      const res = await calculateEmergencyRouteApi(selectedSourceId, emergencyType, accessibleOnly);
      setSelectedDestId(res.emergencyLocation.nodeId);
      setRouteResult(res.route);
      setActiveTab('map');
      showToast(`🚨 Emergency Route Active: ${res.emergencyLocation.name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Emergency route calculation failed';
      setRouteError(msg);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // 5. Hackathon Judge Demo Automation Actions
  const handleDemoAction = async (actionKey: string) => {
    switch (actionKey) {
      case 'find_ai_lab':
        setSelectedSourceId(1); // Main Campus Gate
        setSelectedDestId(14); // AI & ML Lab
        setAccessibleOnly(false);
        setActiveTab('map');
        showToast('🎯 Step 1: Navigating from Main Gate to AI Laboratory (Floor 1)');
        break;

      case 'accessible_route':
        setSelectedSourceId(1);
        setSelectedDestId(14);
        setAccessibleOnly(true);
        setActiveTab('map');
        showToast('♿ Step 2: Accessible Mode enabled. Bypassing stairs via ADA Elevator!');
        break;

      case 'block_path':
        try {
          // Toggle blockage on Central to CSE Walkway (Path 112)
          await togglePathBlockApi(112, 'Construction: Paver stone replacement and trenching');
          await loadCampusData();
          setActiveTab('map');
          showToast('⚠️ Step 3: Main Walkway Blocked! Dijkstra engine dynamically rerouting...');
          setTimeout(() => {
            computeRoute(selectedSourceId, selectedDestId, accessibleOnly);
          }, 400);
        } catch (err) {
          console.error(err);
        }
        break;

      case 'start_ar':
        setActiveTab('map');
        setIsAROpen(true);
        showToast('🕶️ Step 4: Holographic AR Navigation Mode Activated!');
        break;

      case 'emergency_medical':
        handleSelectEmergency('medical');
        break;

      case 'find_library':
        setSelectedSourceId(1);
        setSelectedDestId(8); // Library Reading Hall
        setAccessibleOnly(false);
        setActiveTab('map');
        showToast('📚 Step 6: Route to Central Library 1st Floor Reading Hall calculated');
        break;

      case 'reset_demo':
        try {
          await resetDemoDataApi();
          await loadCampusData();
          setSelectedSourceId(1);
          setSelectedDestId(14);
          setAccessibleOnly(false);
          setActiveTab('map');
          showToast('🔄 Demo Graph Reset to pristine initial state');
        } catch (err) {
          console.error(err);
        }
        break;

      default:
        break;
    }
  };

  const blockedCount = paths.filter((p) => p.isBlocked).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        blockedCount={blockedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {/* VIEW 1: LANDING PAGE */}
        {activeTab === 'landing' && (
          <LandingHero
            onStartNavigation={(destId) => {
              if (destId) setSelectedDestId(destId);
              setActiveTab('map');
            }}
            onExploreCampus={() => setActiveTab('map')}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            facilities={facilities}
          />
        )}

        {/* VIEW 2: INTERACTIVE CAMPUS MAP & ROUTE PANEL */}
        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
            {/* Context Header & Quick Origin/Destination Pickers */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                {/* Source Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Start (Origin):</span>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-950 text-emerald-400 font-bold rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {nodes
                      .filter((n) => n.floor === 0 || n.type === 'gate')
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          🟢 {n.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Destination Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Destination:</span>
                  <select
                    value={selectedDestId}
                    onChange={(e) => setSelectedDestId(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-950 text-cyan-300 font-bold rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        🎯 {n.name} {n.floor > 0 ? `(L${n.floor})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAROpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-cyan-500/20 hover:from-cyan-400 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Eye className="w-4 h-4 stroke-[2.5]" />
                  <span>Launch AR</span>
                </button>

                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Judge Demo Flow</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Interactive Canvas Map on Left, Route Guidance on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 w-full">
                <CampusMap
                  nodes={nodes}
                  paths={paths}
                  routeResult={routeResult}
                  selectedSourceId={selectedSourceId}
                  selectedDestId={selectedDestId}
                  onSelectNodeAsSource={(id) => setSelectedSourceId(id)}
                  onSelectNodeAsDest={(id) => setSelectedDestId(id)}
                />
              </div>

              <div className="lg:col-span-4 w-full">
                <RoutePanel
                  routeResult={routeResult}
                  isLoading={isLoadingRoute}
                  error={routeError}
                  accessibleOnly={accessibleOnly}
                  onToggleAccessible={(val) => setAccessibleOnly(val)}
                  onStartAR={() => setIsAROpen(true)}
                  onSimulatePathBlock={() => handleDemoAction('block_path')}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SMART DESTINATION SEARCH & DIRECTORY */}
        {activeTab === 'search' && (
          <DestinationSearch
            facilities={facilities}
            nodes={nodes}
            selectedSourceId={selectedSourceId}
            onSelectDestination={handleSelectDestination}
          />
        )}

        {/* VIEW 4: ADMIN CONSOLE */}
        {activeTab === 'admin' && (
          <AdminPanel
            nodes={nodes}
            paths={paths}
            reports={reports}
            buildings={buildings}
            onDataChanged={loadCampusData}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
          />
        )}
      </main>

      {/* AR Navigation Holographic HUD Modal */}
      {isAROpen && routeResult && (
        <ARView
          routeResult={routeResult}
          onClose={() => setIsAROpen(false)}
          destinationName={targetFacility?.name || destinationNode?.name || 'Selected Destination'}
          buildingName={targetFacility?.buildingName || destinationNode?.buildingName}
        />
      )}

      {/* Emergency Navigation Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onSelectEmergency={handleSelectEmergency}
      />

      {/* User Path Obstruction Report Modal */}
      <PathReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onReportSubmitted={loadCampusData}
        paths={paths}
      />

      {/* Judge Hackathon Demo Assistant */}
      <HackathonDemoBar
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onDemoAction={handleDemoAction}
      />
    </div>
  );
}
