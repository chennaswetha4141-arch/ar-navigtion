import type {
  Building,
  EmergencyLocation,
  Facility,
  NavigationNode,
  NavigationPath,
  PathReport,
  RouteResult,
} from '../types/campus';

const BASE_URL = '/api';

export async function fetchBuildings(): Promise<Building[]> {
  const res = await fetch(`${BASE_URL}/buildings`);
  if (!res.ok) throw new Error('Failed to load buildings');
  return res.json();
}

export async function fetchFacilities(query = ''): Promise<Facility[]> {
  const url = query
    ? `${BASE_URL}/facilities/search?query=${encodeURIComponent(query)}`
    : `${BASE_URL}/facilities`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load facilities');
  return res.json();
}

export async function fetchNodes(): Promise<NavigationNode[]> {
  const res = await fetch(`${BASE_URL}/nodes`);
  if (!res.ok) throw new Error('Failed to load navigation nodes');
  return res.json();
}

export async function fetchPaths(): Promise<NavigationPath[]> {
  const res = await fetch(`${BASE_URL}/paths`);
  if (!res.ok) throw new Error('Failed to load navigation paths');
  return res.json();
}

export async function calculateRouteApi(
  sourceNodeId: number,
  destinationNodeId: number,
  accessibleOnly = false
): Promise<RouteResult> {
  const res = await fetch(`${BASE_URL}/navigation/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceNodeId, destinationNodeId, accessibleOnly }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'No walkable route found between points');
  }
  return res.json();
}

export async function calculateEmergencyRouteApi(
  sourceNodeId: number,
  emergencyType?: string,
  accessibleOnly = false
): Promise<{ emergencyLocation: EmergencyLocation; route: RouteResult }> {
  const res = await fetch(`${BASE_URL}/emergency/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceNodeId, emergencyType, accessibleOnly }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to calculate emergency evacuation route');
  }
  return res.json();
}

export async function fetchPathReports(): Promise<PathReport[]> {
  const res = await fetch(`${BASE_URL}/path-reports`);
  if (!res.ok) throw new Error('Failed to load path reports');
  return res.json();
}

export async function submitPathReport(report: {
  pathId?: number;
  locationName: string;
  problemType: string;
  description: string;
  severity?: string;
  reporterName?: string;
}): Promise<PathReport> {
  const res = await fetch(`${BASE_URL}/path-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error('Failed to submit path report');
  return res.json();
}

export async function approvePathReport(id: number): Promise<PathReport> {
  const res = await fetch(`${BASE_URL}/path-reports/${id}/approve`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to approve report');
  return res.json();
}

export async function rejectPathReport(id: number): Promise<PathReport> {
  const res = await fetch(`${BASE_URL}/path-reports/${id}/reject`, {
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to reject report');
  return res.json();
}

export async function togglePathBlockApi(id: number, reason?: string): Promise<{ path: NavigationPath }> {
  const res = await fetch(`${BASE_URL}/paths/${id}/toggle-block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('Failed to toggle path status');
  return res.json();
}

export async function resetDemoDataApi(): Promise<void> {
  await fetch(`${BASE_URL}/admin/reset-demo`, { method: 'POST' });
}
