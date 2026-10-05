import type {
  Building,
  EmergencyLocation,
  Facility,
  NavigationNode,
  NavigationPath,
  PathReport,
  RouteResult,
} from '../types/campus';
import {
  getLocalBuildings,
  getLocalFacilities,
  getLocalNodes,
  getLocalPaths,
  getLocalReports,
  calculateLocalRoute,
  calculateLocalEmergencyRoute,
  toggleLocalPathBlock,
  submitLocalReport,
  approveLocalReport,
  rejectLocalReport,
  resetLocalDemo,
} from './localCampusEngine';

const BASE_URL = '/api';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchBuildings(): Promise<Building[]> {
  const data = await safeFetchJson<Building[]>(`${BASE_URL}/buildings`);
  if (data && Array.isArray(data)) return data;
  return getLocalBuildings();
}

export async function fetchFacilities(query = ''): Promise<Facility[]> {
  const url = query
    ? `${BASE_URL}/facilities/search?query=${encodeURIComponent(query)}`
    : `${BASE_URL}/facilities`;
  const data = await safeFetchJson<Facility[]>(url);
  if (data && Array.isArray(data)) return data;
  return getLocalFacilities(query);
}

export async function fetchNodes(): Promise<NavigationNode[]> {
  const data = await safeFetchJson<NavigationNode[]>(`${BASE_URL}/nodes`);
  if (data && Array.isArray(data)) return data;
  return getLocalNodes();
}

export async function fetchPaths(): Promise<NavigationPath[]> {
  const data = await safeFetchJson<NavigationPath[]>(`${BASE_URL}/paths`);
  if (data && Array.isArray(data)) return data;
  return getLocalPaths();
}

export async function calculateRouteApi(
  sourceNodeId: number,
  destinationNodeId: number,
  accessibleOnly = false
): Promise<RouteResult> {
  const data = await safeFetchJson<RouteResult>(`${BASE_URL}/navigation/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceNodeId, destinationNodeId, accessibleOnly }),
  });
  if (data && data.nodes && data.nodes.length > 0) return data;
  return calculateLocalRoute(sourceNodeId, destinationNodeId, accessibleOnly);
}

export async function calculateEmergencyRouteApi(
  sourceNodeId: number,
  emergencyType?: string,
  accessibleOnly = false
): Promise<{ emergencyLocation: EmergencyLocation; route: RouteResult }> {
  const data = await safeFetchJson<{ emergencyLocation: EmergencyLocation; route: RouteResult }>(
    `${BASE_URL}/emergency/route`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceNodeId, emergencyType, accessibleOnly }),
    }
  );
  if (data && data.route && data.emergencyLocation) return data;
  return calculateLocalEmergencyRoute(sourceNodeId, emergencyType, accessibleOnly);
}

export async function fetchPathReports(): Promise<PathReport[]> {
  const data = await safeFetchJson<PathReport[]>(`${BASE_URL}/path-reports`);
  if (data && Array.isArray(data)) return data;
  return getLocalReports();
}

export async function submitPathReport(report: {
  pathId?: number;
  locationName: string;
  problemType: string;
  description: string;
  severity?: string;
  reporterName?: string;
}): Promise<PathReport> {
  const data = await safeFetchJson<{ report: PathReport }>(`${BASE_URL}/path-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (data && data.report) return data.report;
  return submitLocalReport(report);
}

export async function approvePathReport(id: number): Promise<PathReport> {
  const data = await safeFetchJson<{ report: PathReport }>(`${BASE_URL}/path-reports/${id}/approve`, {
    method: 'PUT',
  });
  if (data && data.report) return data.report;
  const rep = approveLocalReport(id);
  if (!rep) throw new Error('Report not found');
  return rep;
}

export async function rejectPathReport(id: number): Promise<PathReport> {
  const data = await safeFetchJson<{ report: PathReport }>(`${BASE_URL}/path-reports/${id}/reject`, {
    method: 'PUT',
  });
  if (data && data.report) return data.report;
  const rep = rejectLocalReport(id);
  if (!rep) throw new Error('Report not found');
  return rep;
}

export async function togglePathBlockApi(id: number, reason?: string): Promise<{ path: NavigationPath }> {
  const data = await safeFetchJson<{ path: NavigationPath }>(`${BASE_URL}/paths/${id}/toggle-block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (data && data.path) return data;
  const localP = toggleLocalPathBlock(id, reason);
  if (!localP) throw new Error('Path not found');
  return { path: localP };
}

export async function resetDemoDataApi(): Promise<void> {
  await safeFetchJson(`${BASE_URL}/admin/reset-demo`, { method: 'POST' });
  resetLocalDemo();
}
