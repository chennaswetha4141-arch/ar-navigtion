import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Compass,
  CheckCircle,
  Eye,
  Filter,
  Navigation,
} from 'lucide-react';
import type { Facility, NavigationNode } from '../types/campus';

interface DestinationSearchProps {
  facilities: Facility[];
  nodes: NavigationNode[];
  selectedSourceId: number;
  onSelectDestination: (nodeId: number, triggerAR?: boolean) => void;
}

export const DestinationSearch: React.FC<DestinationSearchProps> = ({
  facilities,
  nodes,
  selectedSourceId,
  onSelectDestination,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'lab', label: 'Labs' },
    { id: 'library', label: 'Library' },
    { id: 'auditorium', label: 'Auditorium' },
    { id: 'canteen', label: 'Food & Cafe' },
    { id: 'medical', label: 'Health & Medical' },
    { id: 'security', label: 'Security & SOS' },
    { id: 'parking', label: 'Parking' },
    { id: 'hostel', label: 'Hostels' },
  ];

  const sourceNode = useMemo(
    () => nodes.find((n) => n.id === selectedSourceId),
    [nodes, selectedSourceId]
  );

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        f.buildingName.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.features.some((feat) => feat.toLowerCase().includes(q)) ||
        f.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [facilities, searchTerm, selectedCategory]);

  // Rough straight-line estimation for distance display on list items
  const getEstimatedDistance = (destNodeId: number) => {
    const dest = nodes.find((n) => n.id === destNodeId);
    if (!sourceNode || !dest) return { dist: 250, time: 3 };
    const dx = dest.x - sourceNode.x;
    const dy = dest.y - sourceNode.y;
    const straightDist = Math.sqrt(dx * dx + dy * dy);
    // Multiply by factor 0.8 for campus scaling to meters
    const approxMeters = Math.max(50, Math.round(straightDist * 0.75 + (dest.floor > 0 ? 60 : 0)));
    const approxMins = Math.max(1, Math.round(approxMeters / 75));
    return { dist: approxMeters, time: approxMins };
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Smart Campus Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search labs, faculty halls, dining centers, and services across all campus buildings
          </p>
        </div>

        {sourceNode && (
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Current Origin:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              {sourceNode.name}
            </span>
          </div>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by lab name, department (CSE, ECE), floor, or feature (GPU, quiet)..."
          className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm transition-all shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Interactive Filter Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-base font-semibold text-slate-400">No destinations match your query</div>
            <p className="text-xs text-slate-500 mt-1">Try searching for &ldquo;AI&rdquo;, &ldquo;Library&rdquo;, &ldquo;CSE&rdquo;, or &ldquo;Medical&rdquo;.</p>
          </div>
        ) : (
          filteredFacilities.map((fac) => {
            const { dist, time } = getEstimatedDistance(fac.nodeId);
            return (
              <div
                key={fac.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono text-cyan-400">{fac.code}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${fac.status === 'open' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span className="capitalize">{fac.status}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {fac.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{fac.buildingName}</span>
                    <span>·</span>
                    <span className="font-mono text-cyan-300">
                      {fac.floor === 0 ? 'Ground Floor' : `Floor ${fac.floor}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {fac.description}
                  </p>

                  {/* Feature tag pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {fac.features.slice(0, 3).map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Estimated Distance & Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono">~{dist} m</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono">~{time} min</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDestination(fac.nodeId, false)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Route</span>
                    </button>
                    <button
                      onClick={() => onSelectDestination(fac.nodeId, true)}
                      className="px-3 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-600/60 text-teal-300 font-bold text-xs transition-colors flex items-center gap-1 active:scale-95"
                      title="Launch directly into AR Navigation"
                    >
                      <Eye className="w-3 h-3" />
                      <span>AR</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
