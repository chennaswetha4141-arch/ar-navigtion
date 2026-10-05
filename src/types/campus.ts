export interface NavigationNode {
  id: number;
  name: string;
  buildingId?: number;
  buildingName?: string;
  floor: number; // 0: Ground, 1: 1st Floor, 2: 2nd Floor
  type:
    | 'gate'
    | 'building_entrance'
    | 'junction'
    | 'room'
    | 'stairs'
    | 'elevator'
    | 'emergency'
    | 'parking'
    | 'canteen'
    | 'auditorium'
    | 'library'
    | 'facility';
  x: number; // 0 to 1000 map coordinates
  y: number; // 0 to 700 map coordinates
  isAccessible: boolean;
  isEmergency?: boolean;
  emergencyType?: 'medical' | 'security' | 'exit' | 'police';
  description?: string;
}

export interface NavigationPath {
  id: number;
  sourceNodeId: number;
  destinationNodeId: number;
  distance: number; // in meters
  isIndoor: boolean;
  isStairs: boolean;
  isElevator: boolean;
  isAccessible: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  floor: number;
  bidirectional: boolean;
}

export interface Building {
  id: number;
  name: string;
  code: string;
  category: 'academic' | 'administrative' | 'amenity' | 'residential' | 'emergency';
  floors: number[];
  entranceNodeIds: number[];
  description: string;
  openHours: string;
  facilities: string[];
}

export interface Facility {
  id: number;
  name: string;
  code: string;
  nodeId: number;
  buildingId?: number;
  buildingName: string;
  floor: number;
  department: string;
  category:
    | 'lab'
    | 'classroom'
    | 'library'
    | 'canteen'
    | 'auditorium'
    | 'hostel'
    | 'medical'
    | 'security'
    | 'parking'
    | 'restroom'
    | 'office';
  features: string[];
  status: 'open' | 'closed' | 'restricted';
  description: string;
}

export interface TurnInstruction {
  stepNumber: number;
  nodeId: number;
  nodeName: string;
  action:
    | 'straight'
    | 'turn_left'
    | 'turn_right'
    | 'slight_left'
    | 'slight_right'
    | 'stairs_up'
    | 'stairs_down'
    | 'elevator'
    | 'arrive';
  text: string;
  distanceMeters: number;
  floorChange?: number;
  landmark?: string;
}

export interface RouteResult {
  distance: number;
  estimatedTime: number; // in minutes
  accessibleOnly: boolean;
  nodes: NavigationNode[];
  pathIds: number[];
  route: string[];
  instructions: TurnInstruction[];
  isRerouted: boolean;
  rerouteReason?: string;
  alternativeRouteAvailable?: boolean;
}

export interface PathReport {
  id: number;
  pathId?: number;
  locationName: string;
  problemType: 'blocked_road' | 'construction' | 'closed_building' | 'broken_pathway' | 'temporary_restriction';
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reportedAt: string;
  reporterName: string;
}

export interface EmergencyLocation {
  id: number;
  name: string;
  type: 'medical' | 'security' | 'exit' | 'police';
  nodeId: number;
  buildingName: string;
  contactNumber: string;
  description: string;
}
