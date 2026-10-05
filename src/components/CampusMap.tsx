import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  AlertTriangle,
  Compass,
  Navigation,
  CheckCircle,
} from 'lucide-react';
import type { NavigationNode, NavigationPath, RouteResult } from '../types/campus';

interface CampusMapProps {
  nodes: NavigationNode[];
  paths: NavigationPath[];
  routeResult: RouteResult | null;
  selectedSourceId: number;
  selectedDestId: number;
  onSelectNodeAsSource: (id: number) => void;
  onSelectNodeAsDest: (id: number) => void;
  onTogglePathBlock?: (id: number) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  nodes,
  paths,
  routeResult,
  selectedSourceId,
  selectedDestId,
  onSelectNodeAsSource,
  onSelectNodeAsDest,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeFloor, setActiveFloor] = useState<number | 'all'>('all');
  const [hoveredNode, setHoveredNode] = useState<NavigationNode | null>(null);
  const [pinnedNode, setPinnedNode] = useState<NavigationNode | null>(null);

  const displayedNode = pinnedNode || hoveredNode;

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const activePathIdSet = useMemo(() => {
    return new Set(routeResult?.pathIds || []);
  }, [routeResult]);

  const visibleNodes = useMemo(() => {
    if (activeFloor === 'all') return nodes;
    return nodes.filter((n) => n.floor === activeFloor || n.floor === 0);
  }, [nodes, activeFloor]);

  return (
    <div className="relative w-full h-[600px] lg:h-[720px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl select-none">
      {/* Top Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Floor Level Filter */}
        <div className="flex items-center p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-lg text-xs font-semibold text-slate-300">
          <div className="px-2.5 py-1 text-slate-400 flex items-center gap-1.5 border-r border-slate-800">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Floor:</span>
          </div>
          {(['all', 0, 1, 2] as const).map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeFloor === floor
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'hover:text-white'
              }`}
            >
              {floor === 'all' ? 'All Levels' : floor === 0 ? 'Ground' : `L${floor}`}
            </button>
          ))}
        </div>

        {/* Legend status indicators */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-xs text-slate-300 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Current Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-rose-500 rounded" />
            <span>Blocked Path</span>
          </div>
        </div>
      </div>

      {/* Zoom / Pan Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 shadow-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.6))}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 shadow-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 shadow-lg transition-colors"
          title="Reset Campus View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas Map */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 700"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>

            {/* Glowing route filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Hazard stripe pattern for blocked paths */}
            <pattern id="hazard" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="6" />
              <line x1="6" y1="0" x2="6" y2="12" stroke="#1e293b" strokeWidth="6" />
            </pattern>
          </defs>

          {/* Background Field */}
          <rect width="1000" height="700" fill="#030712" />
          <rect width="1000" height="700" fill="url(#campus-grid)" />

          {/* Campus Zones / Lawn Quads */}
          {/* Central Lawn & Quad */}
          <ellipse cx="440" cy="430" rx="140" ry="110" fill="#064e3b" fillOpacity="0.3" stroke="#047857" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="4 4" />
          {/* North Quad Lawn */}
          <rect x="250" y="80" width="180" height="110" rx="20" fill="#064e3b" fillOpacity="0.25" stroke="#047857" strokeOpacity="0.3" />
          {/* East Lawn Quad */}
          <ellipse cx="570" cy="510" rx="90" ry="60" fill="#064e3b" fillOpacity="0.2" />

          {/* Central Water Fountain */}
          <circle cx="440" cy="430" r="32" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="440" cy="430" r="16" fill="#38bdf8" fillOpacity="0.4" />
          <circle cx="440" cy="430" r="6" fill="#7dd3fc" />

          {/* Campus Architectural Building Footprints */}
          {/* 1. CSE Block (Multi-story complex) */}
          <g>
            <rect x="600" y="370" width="310" height="180" rx="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" />
            <rect x="605" y="375" width="300" height="170" rx="12" fill="#1e293b" fillOpacity="0.6" />
            <text x="755" y="395" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="700" letterSpacing="0.05em">
              COMPUTER SCIENCE COMPLEX (CSE)
            </text>
            {/* Visual floor sectors inside CSE */}
            <rect x="615" y="410" width="80" height="100" rx="8" fill="#334155" fillOpacity="0.4" stroke="#475569" strokeWidth="1" />
            <text x="655" y="465" textAnchor="middle" fill="#cbd5e1" fontSize="10">Atrium</text>

            <rect x="710" y="410" width="40" height="40" rx="6" fill="#475569" fillOpacity="0.5" />
            <text x="730" y="435" textAnchor="middle" fill="#94a3b8" fontSize="9">Stairs</text>

            <rect x="710" y="475" width="40" height="40" rx="6" fill="#0369a1" fillOpacity="0.4" stroke="#0284c7" strokeWidth="1" />
            <text x="730" y="500" textAnchor="middle" fill="#38bdf8" fontSize="9">Elevator</text>

            <rect x="800" y="400" width="100" height="50" rx="8" fill="#1e1b4b" fillOpacity="0.7" stroke="#6366f1" strokeWidth="1.5" />
            <text x="850" y="425" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">AI Lab 101</text>
            <text x="850" y="440" textAnchor="middle" fill="#6366f1" fontSize="8">FLOOR 1</text>

            <rect x="800" y="480" width="100" height="50" rx="8" fill="#1e293b" fillOpacity="0.6" stroke="#475569" strokeWidth="1" />
            <text x="850" y="505" textAnchor="middle" fill="#cbd5e1" fontSize="10">CS Lab 102</text>
            <text x="850" y="520" textAnchor="middle" fill="#64748b" fontSize="8">FLOOR 1</text>
          </g>

          {/* 2. ECE Block */}
          <g>
            <rect x="600" y="580" width="220" height="90" rx="14" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <text x="710" y="605" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700">
              ECE BLOCK & SEMINAR HALL
            </text>
          </g>

          {/* 3. Central Library */}
          <g>
            <rect x="360" y="180" width="160" height="145" rx="14" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" strokeOpacity="0.6" />
            <text x="440" y="210" textAnchor="middle" fill="#5eead4" fontSize="11" fontWeight="700">
              CENTRAL LIBRARY
            </text>
            <text x="440" y="226" textAnchor="middle" fill="#94a3b8" fontSize="9">
              Ground + 1st Floor Study
            </text>
          </g>

          {/* 4. Grand Auditorium */}
          <g>
            <path d="M 560 210 L 680 160 L 740 230 L 620 280 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" />
            <text x="650" y="225" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">
              AUDITORIUM
            </text>
            {/* ADA Ramp indicator */}
            <path d="M 545 285 L 575 275" stroke="#10b981" strokeWidth="3" strokeDasharray="3 2" />
            <text x="560" y="302" textAnchor="middle" fill="#34d399" fontSize="8">ADA Ramp</text>
          </g>

          {/* 5. Student Center & Canteen */}
          <g>
            <rect x="200" y="210" width="130" height="100" rx="14" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" strokeOpacity="0.6" />
            <text x="265" y="245" textAnchor="middle" fill="#f472b6" fontSize="11" fontWeight="700">
              FOOD COURT
            </text>
          </g>

          {/* 6. Medical Center */}
          <g>
            <rect x="180" y="320" width="100" height="75" rx="12" fill="#1c1917" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.7" />
            <text x="230" y="348" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700">
              HEALTH CTR
            </text>
            <path d="M 230 355 L 230 375 M 220 365 L 240 365" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* 7. Security Office */}
          <g>
            <rect x="150" y="520" width="80" height="60" rx="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="190" y="545" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="700">
              SECURITY
            </text>
          </g>

          {/* 8. North Hostels */}
          <g>
            <rect x="280" y="60" width="140" height="60" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <text x="350" y="90" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
              RESIDENCE QUAD
            </text>
          </g>

          {/* 9. Visitor Parking */}
          <g>
            <rect x="70" y="350" width="90" height="90" rx="10" fill="#0f172a" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="115" y="395" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700">
              PARKING
            </text>
            <text x="115" y="415" textAnchor="middle" fill="#64748b" fontSize="9">
              EV Charging
            </text>
          </g>

          {/* Main Entrance Gate Portal */}
          <g>
            <rect x="70" y="550" width="90" height="50" rx="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
            <text x="115" y="575" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="bold">
              MAIN GATE
            </text>
          </g>

          {/* PATH EDGES */}
          {paths.map((p) => {
            const s = nodeMap.get(p.sourceNodeId);
            const d = nodeMap.get(p.destinationNodeId);
            if (!s || !d) return null;

            const isActiveRoute = activePathIdSet.has(p.id);

            // If path is BLOCKED
            if (p.isBlocked) {
              return (
                <g key={`path-${p.id}`}>
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={d.x}
                    y2={d.y}
                    stroke="#ef4444"
                    strokeWidth="5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                  {/* Midpoint Barrier Marker */}
                  <circle
                    cx={(s.x + d.x) / 2}
                    cy={(s.y + d.y) / 2}
                    r="9"
                    fill="#ef4444"
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  <line
                    x1={(s.x + d.x) / 2 - 4}
                    y1={(s.y + d.y) / 2}
                    x2={(s.x + d.x) / 2 + 4}
                    y2={(s.y + d.y) / 2}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              );
            }

            // If part of active route
            if (isActiveRoute) {
              return (
                <g key={`path-${p.id}`} filter="url(#glow)">
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={d.x}
                    y2={d.y}
                    stroke="#22d3ee"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Animated directional dashed overlay */}
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={d.x}
                    y2={d.y}
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </g>
              );
            }

            // Standard Walkway
            return (
              <line
                key={`path-${p.id}`}
                x1={s.x}
                y1={s.y}
                x2={d.x}
                y2={d.y}
                stroke={p.isStairs ? '#94a3b8' : p.isElevator ? '#0284c7' : '#334155'}
                strokeWidth={p.isStairs || p.isElevator ? '2' : '2.5'}
                strokeDasharray={p.isStairs ? '3 3' : undefined}
                strokeOpacity="0.7"
              />
            );
          })}

          {/* NODES */}
          {visibleNodes.map((n) => {
            const isSource = n.id === selectedSourceId;
            const isDest = n.id === selectedDestId;
            const isEmergency = n.isEmergency;
            const isDestinationInRoute = routeResult?.nodes.some((node) => node.id === n.id);

            return (
              <g
                key={`node-${n.id}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={(e) => {
                  e.stopPropagation();
                  setPinnedNode(n);
                }}
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Pulsing ring for current origin */}
                {isSource && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="18"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    className="animate-pulse-ring"
                  />
                )}

                {/* Pulsing ring for target destination */}
                {isDest && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="18"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    className="animate-pulse-ring"
                  />
                )}

                {/* Base Node Circle */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isSource || isDest ? 8 : isEmergency ? 6 : 5}
                  fill={
                    isSource
                      ? '#10b981'
                      : isDest
                      ? '#06b6d4'
                      : isEmergency
                      ? '#ef4444'
                      : isDestinationInRoute
                      ? '#38bdf8'
                      : '#64748b'
                  }
                  stroke="#020617"
                  strokeWidth="2"
                />

                {/* Node Name Label */}
                {(isSource || isDest || n.type === 'room' || n.type === 'gate' || n.isEmergency) && (
                  <text
                    x={n.x}
                    y={n.y - 12}
                    textAnchor="middle"
                    fill={isSource ? '#34d399' : isDest ? '#38bdf8' : isEmergency ? '#f87171' : '#cbd5e1'}
                    fontSize="9"
                    fontWeight={isSource || isDest ? 'bold' : '600'}
                    className="drop-shadow-md pointer-events-none"
                  >
                    {isSource ? '🟢 START: ' : isDest ? '🎯 GOAL: ' : ''}
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered / Pinned Node Quick Tooltip / Card */}
      {displayedNode && (
        <div className="absolute bottom-4 left-4 z-20 p-3 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl max-w-sm pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">{displayedNode.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400">
                {displayedNode.floor === 0 ? 'Ground' : `Floor ${displayedNode.floor}`}
              </span>
              {pinnedNode && (
                <button
                  onClick={() => setPinnedNode(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {displayedNode.description && (
            <p className="text-xs text-slate-400 mt-1">{displayedNode.description}</p>
          )}

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={() => {
                onSelectNodeAsSource(displayedNode.id);
                setPinnedNode(null);
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium flex items-center gap-1"
            >
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>Set as Start</span>
            </button>
            <button
              onClick={() => {
                onSelectNodeAsDest(displayedNode.id);
                setPinnedNode(null);
              }}
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Navigate Here</span>
            </button>
          </div>
        </div>
      )}

      {/* Reroute Alert Banner overlay on Map */}
      {routeResult?.isRerouted && (
        <div className="absolute top-16 left-4 right-4 z-20 max-w-xl mx-auto p-3 bg-amber-950/95 backdrop-blur-md rounded-xl border border-amber-600/80 shadow-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
          <div className="text-xs">
            <div className="font-bold text-amber-200 flex items-center gap-2">
              <span>⚠️ Path Blocked & Rerouted</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                Alternative Route Found
              </span>
            </div>
            <p className="text-amber-300/80 mt-0.5">{routeResult.rerouteReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};
