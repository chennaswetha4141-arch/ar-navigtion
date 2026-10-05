import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  Building,
  EmergencyLocation,
  Facility,
  NavigationNode,
  NavigationPath,
  PathReport,
  RouteResult,
  TurnInstruction,
} from './src/types/campus.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// ==========================================
// 1. In-Memory Graph & Campus Seed Database
// ==========================================

const INITIAL_BUILDINGS: Building[] = [
  {
    id: 1,
    name: 'Computer Science & Engineering Block',
    code: 'CSE',
    category: 'academic',
    floors: [0, 1, 2],
    entranceNodeIds: [9],
    description: 'Home to Department of Computer Science, AI Lab, Data Engineering & Cyber Security.',
    openHours: '08:00 AM - 08:00 PM',
    facilities: ['AI Laboratory', 'Computer Lab 102', 'Robotics & IoT Center', 'Server Hub', 'Restrooms', 'Elevator'],
  },
  {
    id: 2,
    name: 'Electronics & Communication Block',
    code: 'ECE',
    category: 'academic',
    floors: [0, 1],
    entranceNodeIds: [18],
    description: 'Houses VLSI Labs, Embedded Systems, and the APJ Abdul Kalam Seminar Hall.',
    openHours: '08:00 AM - 07:00 PM',
    facilities: ['Seminar Hall', 'DSP Lab', 'Microcontroller Lab', 'Faculty Offices'],
  },
  {
    id: 3,
    name: 'Central University Library',
    code: 'LIB',
    category: 'academic',
    floors: [0, 1],
    entranceNodeIds: [6],
    description: '3-story knowledge repository with 80,000+ volumes, digital archives, and quiet reading pods.',
    openHours: '07:30 AM - 10:00 PM',
    facilities: ['Reading Hall', 'Digital Lab', 'Circulation Desk', 'Thesis Archive'],
  },
  {
    id: 4,
    name: 'Dr. Vikram Sarabhai Grand Auditorium',
    code: 'AUD',
    category: 'amenity',
    floors: [0],
    entranceNodeIds: [23, 25],
    description: '1,500-seat multi-tier acoustic auditorium for symposiums, convocations, and hackathons.',
    openHours: '09:00 AM - 09:00 PM',
    facilities: ['Main Hall', 'Green Rooms', 'ADA Access Ramp', 'Control Room'],
  },
  {
    id: 5,
    name: 'Campus Student Center & Food Court',
    code: 'CAN',
    category: 'amenity',
    floors: [0],
    entranceNodeIds: [20],
    description: 'Vibrant dining quad with multi-cuisine food stalls, cafe, and student lounge.',
    openHours: '07:00 AM - 11:00 PM',
    facilities: ['Food Court', 'Espresso Bar', 'Outdoor Lawn Seating', 'ATM Point'],
  },
  {
    id: 6,
    name: 'Campus Health Center & Emergency Triage',
    code: 'MED',
    category: 'emergency',
    floors: [0],
    entranceNodeIds: [22],
    description: '24/7 medical station with physician on duty, emergency triage, pharmacy, and ambulance bay.',
    openHours: '24 Hours Open',
    facilities: ['Triage Room', 'Doctor Consultation', 'Pharmacy', 'Stretcher Access'],
  },
  {
    id: 7,
    name: 'Campus Security Headquarters',
    code: 'SEC',
    category: 'emergency',
    floors: [0],
    entranceNodeIds: [2],
    description: 'Central surveillance, ID card issuance, emergency dispatch, and lost & found unit.',
    openHours: '24 Hours Open',
    facilities: ['Surveillance Dispatch', 'Lost & Found', 'Visitor Verification'],
  },
  {
    id: 8,
    name: 'North Residential Hostels & Quad',
    code: 'HST',
    category: 'residential',
    floors: [0, 1, 2, 3],
    entranceNodeIds: [26],
    description: 'Undergraduate student housing quad with recreational courts and laundry hub.',
    openHours: 'Resident Access 24h',
    facilities: ['Common Hall', 'Badminton Court', 'Laundry Room'],
  },
];

const INITIAL_NODES: NavigationNode[] = [
  { id: 1, name: 'Main Campus Gate', floor: 0, type: 'gate', x: 120, y: 560, isAccessible: true, description: 'Primary security checkpoint & visitor arrival point' },
  { id: 2, name: 'Security Command Office', buildingId: 7, buildingName: 'Campus Security Headquarters', floor: 0, type: 'emergency', x: 190, y: 530, isAccessible: true, isEmergency: true, emergencyType: 'security', description: 'Emergency dispatch & safety personnel' },
  { id: 3, name: 'South Quad Junction', floor: 0, type: 'junction', x: 290, y: 500, isAccessible: true, description: 'Major pedestrian walkway crossing south campus' },
  { id: 4, name: 'West Visitor Parking', floor: 0, type: 'parking', x: 120, y: 390, isAccessible: true, description: 'EV charging points & visitor parking lots' },
  { id: 5, name: 'Central Campus Plaza & Fountain', floor: 0, type: 'junction', x: 440, y: 430, isAccessible: true, description: 'Main gathering circle with benches and campus directory' },
  { id: 6, name: 'Library Front Plaza', buildingId: 3, buildingName: 'Central University Library', floor: 0, type: 'building_entrance', x: 440, y: 310, isAccessible: true, description: 'Entrance plaza to Central Library' },
  { id: 7, name: 'Library Ground Circulation', buildingId: 3, buildingName: 'Central University Library', floor: 0, type: 'library', x: 440, y: 250, isAccessible: true, description: 'Circulation desk, return kiosks, digital search' },
  { id: 8, name: 'Library 1st Floor Quiet Hall', buildingId: 3, buildingName: 'Central University Library', floor: 1, type: 'library', x: 440, y: 190, isAccessible: true, description: 'Quiet study pods and research journals' },
  { id: 9, name: 'CSE Block Main Entrance', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 0, type: 'building_entrance', x: 610, y: 460, isAccessible: true, description: 'Glass doors leading to Computer Science complex' },
  { id: 10, name: 'CSE Ground Floor Atrium', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 0, type: 'junction', x: 670, y: 460, isAccessible: true, description: 'Central indoor atrium connecting stairs and elevators' },
  { id: 11, name: 'CSE Central Stairwell', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 0, type: 'stairs', x: 720, y: 425, isAccessible: false, description: 'Indoor stairs (Stairs to 1st & 2nd floors)' },
  { id: 12, name: 'CSE ADA Accessible Elevator', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 0, type: 'elevator', x: 720, y: 495, isAccessible: true, description: 'Wheelchair-certified high-speed elevator' },
  { id: 13, name: 'CSE 1st Floor Landing', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 1, type: 'junction', x: 770, y: 460, isAccessible: true, description: 'First floor foyer outside departmental labs' },
  { id: 14, name: 'AI & Machine Learning Lab', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 1, type: 'room', x: 860, y: 410, isAccessible: true, description: 'Room 101 - GPU cluster, robotics rigs, neural net testing' },
  { id: 15, name: 'Computer Lab 102', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 1, type: 'room', x: 860, y: 510, isAccessible: true, description: 'Room 102 - 60 Linux workstations, compiler tools' },
  { id: 16, name: 'CSE 2nd Floor Landing', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 2, type: 'junction', x: 770, y: 460, isAccessible: true, description: 'Second floor foyer for specialized research centers' },
  { id: 17, name: 'Robotics & IoT Innovation Lab', buildingId: 1, buildingName: 'Computer Science & Engineering Block', floor: 2, type: 'room', x: 860, y: 460, isAccessible: true, description: 'Room 205 - ROS drones, autonomous vehicle testbed' },
  { id: 18, name: 'ECE Block Main Entrance', buildingId: 2, buildingName: 'Electronics & Communication Block', floor: 0, type: 'building_entrance', x: 610, y: 620, isAccessible: true, description: 'Ground entry for ECE laboratories & faculty' },
  { id: 19, name: 'Seminar Hall (Abdul Kalam Hall)', buildingId: 2, buildingName: 'Electronics & Communication Block', floor: 0, type: 'auditorium', x: 730, y: 620, isAccessible: true, description: '250-seat state-of-the-art multimedia presentation hall' },
  { id: 20, name: 'Canteen & Food Court Plaza', buildingId: 5, buildingName: 'Campus Student Center & Food Court', floor: 0, type: 'canteen', x: 310, y: 260, isAccessible: true, description: 'Outdoor cafe terrace and student dining' },
  { id: 21, name: 'Canteen Indoor Dining Hall', buildingId: 5, buildingName: 'Campus Student Center & Food Court', floor: 0, type: 'canteen', x: 260, y: 220, isAccessible: true, description: 'Meal counters, juice corner, coffee bar' },
  { id: 22, name: 'Medical Room & Triage Station', buildingId: 6, buildingName: 'Campus Health Center & Emergency Triage', floor: 0, type: 'emergency', x: 220, y: 320, isAccessible: true, isEmergency: true, emergencyType: 'medical', description: 'First-aid, emergency stretchers, doctor on duty' },
  { id: 23, name: 'Auditorium Main Steps Entrance', buildingId: 4, buildingName: 'Dr. Vikram Sarabhai Grand Auditorium', floor: 0, type: 'building_entrance', x: 580, y: 240, isAccessible: false, description: 'Wide exterior marble staircase to auditorium' },
  { id: 24, name: 'Auditorium Main Stage Hall', buildingId: 4, buildingName: 'Dr. Vikram Sarabhai Grand Auditorium', floor: 0, type: 'auditorium', x: 680, y: 210, isAccessible: true, description: 'Main theater seating and stage' },
  { id: 25, name: 'Auditorium ADA Accessible Ramp Entrance', buildingId: 4, buildingName: 'Dr. Vikram Sarabhai Grand Auditorium', floor: 0, type: 'building_entrance', x: 570, y: 280, isAccessible: true, description: 'Gentle gradient ADA ramp for barrier-free access' },
  { id: 26, name: 'North Hostel Quad Walkway', buildingId: 8, buildingName: 'North Residential Hostels & Quad', floor: 0, type: 'facility', x: 330, y: 110, isAccessible: true, description: 'Pathway to residential blocks A, B & C' },
  { id: 27, name: 'Emergency Exit North Gate', floor: 0, type: 'emergency', x: 620, y: 90, isAccessible: true, isEmergency: true, emergencyType: 'exit', description: 'Perimeter emergency evacuation gate & fire lane' },
  { id: 28, name: 'Emergency Police Help Point SOS', floor: 0, type: 'emergency', x: 470, y: 550, isAccessible: true, isEmergency: true, emergencyType: 'police', description: 'Direct 1-button SOS intercom to security & local police' },
  { id: 29, name: 'East Quad Shaded Bypass Walkway', floor: 0, type: 'junction', x: 520, y: 510, isAccessible: true, description: 'Paved canopy walkway offering alternate detour past central lawn' },
];

const INITIAL_PATHS: NavigationPath[] = [
  // Gate to Security & South Junction
  { id: 101, sourceNodeId: 1, destinationNodeId: 2, distance: 75, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 102, sourceNodeId: 1, destinationNodeId: 3, distance: 180, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 103, sourceNodeId: 1, destinationNodeId: 4, distance: 175, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 104, sourceNodeId: 2, destinationNodeId: 3, distance: 110, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },

  // South Junction to Plaza, Medical, Canteen
  { id: 105, sourceNodeId: 3, destinationNodeId: 5, distance: 140, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 106, sourceNodeId: 3, destinationNodeId: 22, distance: 190, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 107, sourceNodeId: 4, destinationNodeId: 22, distance: 120, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 108, sourceNodeId: 22, destinationNodeId: 20, distance: 110, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 109, sourceNodeId: 20, destinationNodeId: 21, distance: 60, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 110, sourceNodeId: 20, destinationNodeId: 6, distance: 140, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },

  // Central Plaza connections
  { id: 111, sourceNodeId: 5, destinationNodeId: 6, distance: 120, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  // PRIMARY DIRECT PATH TO CSE (Key candidate for obstruction demo!)
  { id: 112, sourceNodeId: 5, destinationNodeId: 9, distance: 130, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  // East Bypass path for automatic rerouting
  { id: 113, sourceNodeId: 3, destinationNodeId: 29, distance: 240, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 114, sourceNodeId: 29, destinationNodeId: 9, distance: 110, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 115, sourceNodeId: 5, destinationNodeId: 29, distance: 115, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 116, sourceNodeId: 3, destinationNodeId: 28, distance: 190, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 117, sourceNodeId: 28, destinationNodeId: 18, distance: 160, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 118, sourceNodeId: 9, destinationNodeId: 18, distance: 160, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },

  // Library indoor navigation
  { id: 119, sourceNodeId: 6, destinationNodeId: 7, distance: 60, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 120, sourceNodeId: 7, destinationNodeId: 8, distance: 70, isIndoor: true, isStairs: false, isElevator: true, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },

  // CSE Indoor navigation: Atrium, Stairs, Elevator, 1st & 2nd Floors
  { id: 121, sourceNodeId: 9, destinationNodeId: 10, distance: 60, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 122, sourceNodeId: 10, destinationNodeId: 11, distance: 55, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 123, sourceNodeId: 10, destinationNodeId: 12, distance: 65, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  // STAIRS: From 11 to 1st Floor Landing 13 (NOT accessible)
  { id: 124, sourceNodeId: 11, destinationNodeId: 13, distance: 60, isIndoor: true, isStairs: true, isElevator: false, isAccessible: false, isBlocked: false, floor: 0, bidirectional: true },
  // ELEVATOR: From 12 to 1st Floor Landing 13 (ACCESSIBLE, slight extra wait/travel distance)
  { id: 125, sourceNodeId: 12, destinationNodeId: 13, distance: 85, isIndoor: true, isStairs: false, isElevator: true, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  // 1st Floor rooms: AI Lab & Computer Lab
  { id: 126, sourceNodeId: 13, destinationNodeId: 14, distance: 95, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 1, bidirectional: true },
  { id: 127, sourceNodeId: 13, destinationNodeId: 15, distance: 95, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 1, bidirectional: true },
  // 2nd floor stairs and elevator
  { id: 128, sourceNodeId: 13, destinationNodeId: 16, distance: 60, isIndoor: true, isStairs: true, isElevator: false, isAccessible: false, isBlocked: false, floor: 1, bidirectional: true },
  { id: 129, sourceNodeId: 12, destinationNodeId: 16, distance: 110, isIndoor: true, isStairs: false, isElevator: true, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 130, sourceNodeId: 16, destinationNodeId: 17, distance: 90, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 2, bidirectional: true },

  // ECE indoor
  { id: 131, sourceNodeId: 18, destinationNodeId: 19, distance: 120, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },

  // Auditorium: Normal Stairs vs ADA Ramp
  { id: 132, sourceNodeId: 6, destinationNodeId: 23, distance: 150, isIndoor: false, isStairs: true, isElevator: false, isAccessible: false, isBlocked: false, floor: 0, bidirectional: true },
  { id: 133, sourceNodeId: 6, destinationNodeId: 25, distance: 180, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 134, sourceNodeId: 5, destinationNodeId: 25, distance: 195, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 135, sourceNodeId: 23, destinationNodeId: 24, distance: 75, isIndoor: true, isStairs: false, isElevator: false, isAccessible: false, isBlocked: false, floor: 0, bidirectional: true },
  { id: 136, sourceNodeId: 25, destinationNodeId: 24, distance: 85, isIndoor: true, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },

  // North Quad and Hostel
  { id: 137, sourceNodeId: 20, destinationNodeId: 26, distance: 160, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 138, sourceNodeId: 6, destinationNodeId: 26, distance: 210, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 139, sourceNodeId: 26, destinationNodeId: 27, distance: 290, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
  { id: 140, sourceNodeId: 24, destinationNodeId: 27, distance: 160, isIndoor: false, isStairs: false, isElevator: false, isAccessible: true, isBlocked: false, floor: 0, bidirectional: true },
];

const INITIAL_FACILITIES: Facility[] = [
  {
    id: 1,
    name: 'AI & Machine Learning Research Lab',
    code: 'LAB-AI-101',
    nodeId: 14,
    buildingId: 1,
    buildingName: 'Computer Science & Engineering Block',
    floor: 1,
    department: 'Computer Science & Engineering',
    category: 'lab',
    features: ['High-end GPU Servers', 'Computer Vision rigs', 'Robotics bench', 'Air Conditioned'],
    status: 'open',
    description: 'Premier research lab for machine learning, neural networks, and computer vision projects.',
  },
  {
    id: 2,
    name: 'High Performance Computer Lab 102',
    code: 'LAB-CS-102',
    nodeId: 15,
    buildingId: 1,
    buildingName: 'Computer Science & Engineering Block',
    floor: 1,
    department: 'Computer Science & Engineering',
    category: 'lab',
    features: ['60 Linux Workstations', 'Dual Monitors', 'Fiber Gigabit LAN', 'Smart Screen'],
    status: 'open',
    description: 'General programming lab for systems, networking, and distributed algorithms.',
  },
  {
    id: 3,
    name: 'Robotics & IoT Innovation Center',
    code: 'LAB-ROB-205',
    nodeId: 17,
    buildingId: 1,
    buildingName: 'Computer Science & Engineering Block',
    floor: 2,
    department: 'Computer Science & Robotics',
    category: 'lab',
    features: ['3D Printers', 'Drone Testing Cage', 'Soldering Stations', 'Oscilloscopes'],
    status: 'open',
    description: 'Multi-disciplinary robotics workshop and drone telemetry center.',
  },
  {
    id: 4,
    name: 'Central University Library - Reading Hall',
    code: 'LIB-HALL-10',
    nodeId: 8,
    buildingId: 3,
    buildingName: 'Central University Library',
    floor: 1,
    department: 'University Library Services',
    category: 'library',
    features: ['Silent Study Zones', 'Reference Section', 'Power Outlets at all desks', 'High-Speed Wi-Fi'],
    status: 'open',
    description: 'Comprehensive physical reference collection with 400 silent study desks.',
  },
  {
    id: 5,
    name: 'Campus Health Center & Emergency Triage Room',
    code: 'MED-EMERGENCY',
    nodeId: 22,
    buildingId: 6,
    buildingName: 'Campus Health Center & Emergency Triage',
    floor: 0,
    department: 'University Medical Services',
    category: 'medical',
    features: ['24/7 Paramedics', 'Cardiac Defibrillator', 'Oxygen Supply', 'Immediate Ambulance Dispatch'],
    status: 'open',
    description: 'Campus emergency medical station with triage beds, pharmacy, and ambulance bay.',
  },
  {
    id: 6,
    name: 'Campus Security Command & Lost & Found',
    code: 'SEC-HQ-01',
    nodeId: 2,
    buildingId: 7,
    buildingName: 'Campus Security Headquarters',
    floor: 0,
    department: 'Campus Safety & Vigilance',
    category: 'security',
    features: ['24h Dispatch Console', 'Lost & Found Locker', 'CCTV Monitor Room', 'Emergency Patrols'],
    status: 'open',
    description: 'Main campus security and dispatch hub located near the main entrance.',
  },
  {
    id: 7,
    name: 'Dr. Vikram Sarabhai Grand Auditorium Hall',
    code: 'AUD-MAIN-01',
    nodeId: 24,
    buildingId: 4,
    buildingName: 'Dr. Vikram Sarabhai Grand Auditorium',
    floor: 0,
    department: 'University Events & Cultural Affairs',
    category: 'auditorium',
    features: ['1,500 Ergonomic Seats', 'Dolby Surround Sound', 'Acoustic Wall Paneling', 'ADA Wheelchair Ramps'],
    status: 'open',
    description: 'Main venue for international conferences, hackathon ceremonies, and convocations.',
  },
  {
    id: 8,
    name: 'Campus Food Court & Dining Terrace',
    code: 'CAN-MAIN',
    nodeId: 20,
    buildingId: 5,
    buildingName: 'Campus Student Center & Food Court',
    floor: 0,
    department: 'Student Amenities Board',
    category: 'canteen',
    features: ['6 Cuisine Outlets', 'Espresso Cafe', 'Fresh Juice Counter', 'Covered Outdoor Seating'],
    status: 'open',
    description: 'Central student culinary hub with diverse hygienic food choices.',
  },
  {
    id: 9,
    name: 'APJ Abdul Kalam Seminar Hall',
    code: 'ECE-SEM-01',
    nodeId: 19,
    buildingId: 2,
    buildingName: 'Electronics & Communication Block',
    floor: 0,
    department: 'Electronics & Communication',
    category: 'auditorium',
    features: ['250 Executive Seats', 'Dual Laser Projectors', 'Video Conferencing Pod', 'Smart Podium'],
    status: 'open',
    description: 'Air-conditioned conference and guest lecture venue.',
  },
  {
    id: 10,
    name: 'West Visitor & Faculty Parking Area',
    code: 'PRK-WEST',
    nodeId: 4,
    buildingId: undefined,
    buildingName: 'West Campus Zone',
    floor: 0,
    department: 'Campus Facilities',
    category: 'parking',
    features: ['120 Car Slots', '250 Two-Wheeler Slots', 'Level 2 EV Charging Stations', '24/7 Boom Barrier'],
    status: 'open',
    description: 'Designated parking for visitors, guest speakers, faculty, and handicapped vehicles.',
  },
  {
    id: 11,
    name: 'North Hostel Quad & Student Living Complex',
    code: 'HST-NORTH-01',
    nodeId: 26,
    buildingId: 8,
    buildingName: 'North Residential Hostels & Quad',
    floor: 0,
    department: 'Student Housing',
    category: 'hostel',
    features: ['Wi-Fi Enabled Lounges', 'Mess Dining', 'Recreational Gym', 'Laundry Service'],
    status: 'restricted',
    description: 'Undergraduate student residence hall with biometric entry.',
  },
  {
    id: 12,
    name: 'Emergency Exit North Gate',
    code: 'EXIT-NORTH',
    nodeId: 27,
    buildingId: undefined,
    buildingName: 'North Perimeter',
    floor: 0,
    department: 'Campus Safety',
    category: 'security',
    features: ['Panic Bar Door', 'Emergency Strobe Light', 'Fire Evacuation Muster Point'],
    status: 'open',
    description: 'Perimeter emergency evacuation gate leading to secondary highway and muster point.',
  },
];

const INITIAL_EMERGENCY_LOCATIONS: EmergencyLocation[] = [
  {
    id: 1,
    name: 'Medical Room & Triage Station',
    type: 'medical',
    nodeId: 22,
    buildingName: 'Campus Health Center',
    contactNumber: '+1 (800) 555-0911 (Ext. 108)',
    description: 'Immediate physician care, ambulance standby, and trauma support.',
  },
  {
    id: 2,
    name: 'Security Command Headquarters',
    type: 'security',
    nodeId: 2,
    buildingName: 'Campus Security Office',
    contactNumber: '+1 (800) 555-0999 (Ext. 100)',
    description: 'Dispatches quick response mobile patrol and monitors campus perimeter.',
  },
  {
    id: 3,
    name: 'Emergency Police Help Point SOS',
    type: 'police',
    nodeId: 28,
    buildingName: 'Central South Plaza SOS',
    contactNumber: '+1 (800) 555-HELP',
    description: 'High-visibility illuminated blue-light pillar with instant two-way speaker.',
  },
  {
    id: 4,
    name: 'Emergency Exit North Gate',
    type: 'exit',
    nodeId: 27,
    buildingName: 'North Perimeter Barrier',
    contactNumber: 'N/A (Evacuation Assembly Point B)',
    description: 'Direct assembly point with wide evacuation fire gate.',
  },
];

const INITIAL_REPORTS: PathReport[] = [
  {
    id: 1,
    pathId: 112,
    locationName: 'Central Plaza to CSE Main Walkway',
    problemType: 'construction',
    description: 'Paver stones being replaced near the fountain corridor. Pathway temporarily barricaded.',
    status: 'PENDING',
    severity: 'MEDIUM',
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reporterName: 'Swetha C. (Student)',
  },
];

// Mutable state for the application session
let buildings = [...INITIAL_BUILDINGS];
let nodes = [...INITIAL_NODES];
let paths = JSON.parse(JSON.stringify(INITIAL_PATHS)) as NavigationPath[];
let facilities = [...INITIAL_FACILITIES];
let emergencyLocations = [...INITIAL_EMERGENCY_LOCATIONS];
let pathReports = [...INITIAL_REPORTS];

// ==========================================
// 2. Dijkstra Shortest-Path & Routing Engine
// ==========================================

interface DijkstraEdge {
  targetNodeId: number;
  weight: number;
  path: NavigationPath;
}

function buildAdjacencyList(accessibleOnly: boolean, ignoreBlocked = false): Map<number, DijkstraEdge[]> {
  const adj = new Map<number, DijkstraEdge[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }

  for (const p of paths) {
    if (p.isBlocked && !ignoreBlocked) {
      continue;
    }
    if (accessibleOnly && !p.isAccessible) {
      continue;
    }
    if (accessibleOnly && p.isStairs) {
      continue;
    }

    const sourceEdges = adj.get(p.sourceNodeId) || [];
    sourceEdges.push({ targetNodeId: p.destinationNodeId, weight: p.distance, path: p });
    adj.set(p.sourceNodeId, sourceEdges);

    if (p.bidirectional) {
      const destEdges = adj.get(p.destinationNodeId) || [];
      destEdges.push({ targetNodeId: p.sourceNodeId, weight: p.distance, path: p });
      adj.set(p.destinationNodeId, destEdges);
    }
  }

  return adj;
}

function runDijkstra(
  sourceId: number,
  destId: number,
  accessibleOnly: boolean,
  ignoreBlocked = false
): {
  found: boolean;
  distance: number;
  nodeIds: number[];
  pathIds: number[];
} {
  const adj = buildAdjacencyList(accessibleOnly, ignoreBlocked);
  const distances = new Map<number, number>();
  const previous = new Map<number, { nodeId: number; pathId: number } | null>();
  const unvisited = new Set<number>();

  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }

  distances.set(sourceId, 0);

  while (unvisited.size > 0) {
    let current: number | null = null;
    let smallestDist = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < smallestDist) {
        smallestDist = dist;
        current = nodeId;
      }
    }

    if (current === null || smallestDist === Infinity) {
      break;
    }
    if (current === destId) {
      break;
    }

    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.targetNodeId)) continue;
      const alt = smallestDist + edge.weight;
      if (alt < distances.get(edge.targetNodeId)!) {
        distances.set(edge.targetNodeId, alt);
        previous.set(edge.targetNodeId, { nodeId: current, pathId: edge.path.id });
      }
    }
  }

  if (distances.get(destId) === Infinity) {
    return { found: false, distance: 0, nodeIds: [], pathIds: [] };
  }

  const nodeIds: number[] = [];
  const pathIds: number[] = [];
  let curr: number | null = destId;

  while (curr !== null && curr !== sourceId) {
    nodeIds.unshift(curr);
    const prevEntry = previous.get(curr);
    if (prevEntry) {
      pathIds.unshift(prevEntry.pathId);
      curr = prevEntry.nodeId;
    } else {
      break;
    }
  }
  if (curr === sourceId) {
    nodeIds.unshift(sourceId);
  }

  return {
    found: true,
    distance: distances.get(destId)!,
    nodeIds,
    pathIds,
  };
}

function generateTurnInstructions(orderedNodes: NavigationNode[], pathIds: number[]): TurnInstruction[] {
  if (orderedNodes.length <= 1) {
    const onlyNode = orderedNodes[0];
    return [
      {
        stepNumber: 1,
        nodeId: onlyNode ? onlyNode.id : 1,
        nodeName: onlyNode ? onlyNode.name : 'Destination',
        action: 'arrive',
        text: onlyNode
          ? `You are already at your destination: ${onlyNode.name}${onlyNode.floor > 0 ? ` (Floor ${onlyNode.floor})` : ''}.`
          : 'You are at your destination.',
        distanceMeters: 0,
        landmark: onlyNode?.description,
      },
    ];
  }

  const instructions: TurnInstruction[] = [];
  const pathMap = new Map(paths.map((p) => [p.id, p]));

  for (let i = 0; i < orderedNodes.length; i++) {
    const currentNode = orderedNodes[i];
    const isFirst = i === 0;
    const isLast = i === orderedNodes.length - 1;
    const stepNumber = i + 1;

    if (isFirst) {
      const nextNode = orderedNodes[i + 1];
      const nextDist = pathIds[0] ? (pathMap.get(pathIds[0])?.distance || 80) : 80;
      instructions.push({
        stepNumber,
        nodeId: currentNode.id,
        nodeName: currentNode.name,
        action: 'straight',
        text: `Depart from ${currentNode.name}. Head forward toward ${nextNode?.name || 'next waypoint'}.`,
        distanceMeters: nextDist,
        landmark: currentNode.description,
      });
      continue;
    }

    if (isLast) {
      instructions.push({
        stepNumber,
        nodeId: currentNode.id,
        nodeName: currentNode.name,
        action: 'arrive',
        text: `You have arrived at your destination: ${currentNode.name}${currentNode.floor > 0 ? ` (Floor ${currentNode.floor})` : ''}.`,
        distanceMeters: 0,
        landmark: currentNode.description,
      });
      continue;
    }

    const prevNode = orderedNodes[i - 1];
    const nextNode = orderedNodes[i + 1];
    const segmentPath = pathMap.get(pathIds[i]);
    const segmentDist = segmentPath?.distance || 75;

    // Floor transitions
    if (currentNode.type === 'stairs' || segmentPath?.isStairs) {
      const floorDiff = nextNode.floor - currentNode.floor;
      instructions.push({
        stepNumber,
        nodeId: currentNode.id,
        nodeName: currentNode.name,
        action: floorDiff >= 0 ? 'stairs_up' : 'stairs_down',
        text: `Take the central stairwell ${floorDiff >= 0 ? 'up' : 'down'} to Floor ${nextNode.floor}.`,
        distanceMeters: segmentDist,
        floorChange: floorDiff,
        landmark: 'Stairs located on the east wing of the atrium',
      });
      continue;
    }

    if (currentNode.type === 'elevator' || segmentPath?.isElevator) {
      const floorDiff = nextNode.floor - currentNode.floor;
      instructions.push({
        stepNumber,
        nodeId: currentNode.id,
        nodeName: currentNode.name,
        action: 'elevator',
        text: `Take the accessible elevator to Floor ${nextNode.floor}.`,
        distanceMeters: segmentDist,
        floorChange: floorDiff,
        landmark: 'Braille keypad & voice announcement elevator',
      });
      continue;
    }

    // Direction calculation using 2D vectors
    const v1x = currentNode.x - prevNode.x;
    const v1y = currentNode.y - prevNode.y;
    const v2x = nextNode.x - currentNode.x;
    const v2y = nextNode.y - currentNode.y;

    // 2D Cross product for turn orientation
    const crossProduct = v1x * v2y - v1y * v2x;
    const dotProduct = v1x * v2x + v1y * v2y;
    const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
    const angleCos = mag1 && mag2 ? dotProduct / (mag1 * mag2) : 1;

    let action: TurnInstruction['action'] = 'straight';
    let turnPhrase = `Continue straight past ${currentNode.name}`;

    if (angleCos < 0.85) {
      if (crossProduct > 1500) {
        action = 'turn_right';
        turnPhrase = `Turn right at ${currentNode.name}`;
      } else if (crossProduct < -1500) {
        action = 'turn_left';
        turnPhrase = `Turn left at ${currentNode.name}`;
      } else if (crossProduct > 0) {
        action = 'slight_right';
        turnPhrase = `Bear slightly right at ${currentNode.name}`;
      } else {
        action = 'slight_left';
        turnPhrase = `Bear slightly left at ${currentNode.name}`;
      }
    }

    instructions.push({
      stepNumber,
      nodeId: currentNode.id,
      nodeName: currentNode.name,
      action,
      text: `${turnPhrase} and proceed ${segmentDist}m toward ${nextNode.name}.`,
      distanceMeters: segmentDist,
      landmark: currentNode.description,
    });
  }

  return instructions;
}

function calculateRoute(
  sourceId: number,
  destId: number,
  accessibleOnly: boolean
): RouteResult | null {
  // Check if standard route would have traversed any blocked paths
  const idealRoute = runDijkstra(sourceId, destId, accessibleOnly, true);
  const activeRoute = runDijkstra(sourceId, destId, accessibleOnly, false);

  if (!activeRoute.found) {
    return null;
  }

  // Check if obstruction rerouting occurred
  let isRerouted = false;
  let rerouteReason: string | undefined;

  if (idealRoute.found) {
    const blockedPathsOnIdeal = idealRoute.pathIds.filter((pId) => {
      const p = paths.find((item) => item.id === pId);
      return p?.isBlocked;
    });

    if (blockedPathsOnIdeal.length > 0) {
      isRerouted = true;
      const blockedObj = paths.find((p) => p.id === blockedPathsOnIdeal[0]);
      const extraDistance = Math.max(0, Math.round(activeRoute.distance - idealRoute.distance));
      rerouteReason = `Obstruction avoided: ${blockedObj?.blockedReason || 'Active construction on primary path'}. Automatically rerouted via alternate bypass (+${extraDistance}m).`;
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const orderedNodes = activeRoute.nodeIds
    .map((id) => nodeMap.get(id))
    .filter((n): n is NavigationNode => Boolean(n));

  const instructions = generateTurnInstructions(orderedNodes, activeRoute.pathIds);

  // Walking speed approx 75 meters per minute
  // Multi-floor penalty: 1 minute per floor transition
  let floorTransitions = 0;
  for (let i = 1; i < orderedNodes.length; i++) {
    if (orderedNodes[i].floor !== orderedNodes[i - 1].floor) {
      floorTransitions++;
    }
  }
  const estimatedTime = Math.max(1, Math.round(activeRoute.distance / 75 + floorTransitions * 1.2));

  return {
    distance: activeRoute.distance,
    estimatedTime,
    accessibleOnly,
    nodes: orderedNodes,
    pathIds: activeRoute.pathIds,
    route: orderedNodes.map((n) => n.name),
    instructions,
    isRerouted,
    rerouteReason,
    alternativeRouteAvailable: isRerouted,
  };
}

// ==========================================
// 3. REST API Endpoints
// ==========================================

// Buildings
app.get('/api/buildings', (_req, res) => {
  res.json(buildings);
});

app.get('/api/buildings/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const building = buildings.find((b) => b.id === id);
  if (!building) {
    return res.status(404).json({ error: 'Building not found' });
  }
  res.json(building);
});

// Facilities & Smart Search
app.get('/api/facilities', (_req, res) => {
  res.json(facilities);
});

app.get('/api/facilities/search', (req, res) => {
  const query = (req.query.query as string || '').toLowerCase().trim();
  if (!query) {
    return res.json(facilities);
  }

  const results = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(query) ||
      f.department.toLowerCase().includes(query) ||
      f.buildingName.toLowerCase().includes(query) ||
      f.code.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query) ||
      f.description.toLowerCase().includes(query) ||
      f.features.some((feat) => feat.toLowerCase().includes(query))
  );

  res.json(results);
});

// Navigation Nodes & Paths
app.get('/api/nodes', (_req, res) => {
  res.json(nodes);
});

app.get('/api/paths', (_req, res) => {
  res.json(paths);
});

// Route Calculation
app.post('/api/navigation/route', (req, res) => {
  const { sourceNodeId, destinationNodeId, accessibleOnly } = req.body;

  if (!sourceNodeId || !destinationNodeId) {
    return res.status(400).json({ error: 'Missing sourceNodeId or destinationNodeId' });
  }

  const sourceNode = nodes.find((n) => n.id === Number(sourceNodeId));
  const destNode = nodes.find((n) => n.id === Number(destinationNodeId));

  if (!sourceNode || !destNode) {
    return res.status(404).json({ error: 'Source or destination node does not exist in graph' });
  }

  const result = calculateRoute(Number(sourceNodeId), Number(destinationNodeId), Boolean(accessibleOnly));

  if (!result) {
    return res.status(404).json({
      error: 'No walkable route found between points. All connecting paths may be blocked or inaccessible for current settings.',
    });
  }

  res.json(result);
});

// Emergency Routing
app.post('/api/emergency/route', (req, res) => {
  const { sourceNodeId, emergencyType, accessibleOnly } = req.body;

  const currentSourceId = Number(sourceNodeId) || 1;
  const targetType = emergencyType as EmergencyLocation['type'] | undefined;

  let targetCandidates = emergencyLocations;
  if (targetType) {
    targetCandidates = emergencyLocations.filter((loc) => loc.type === targetType);
  }

  if (targetCandidates.length === 0) {
    targetCandidates = emergencyLocations;
  }

  // Find nearest emergency destination using Dijkstra
  let shortestResult: RouteResult | null = null;
  let targetLocation: EmergencyLocation | null = null;

  for (const loc of targetCandidates) {
    const route = calculateRoute(currentSourceId, loc.nodeId, Boolean(accessibleOnly));
    if (route) {
      if (!shortestResult || route.distance < shortestResult.distance) {
        shortestResult = route;
        targetLocation = loc;
      }
    }
  }

  if (!shortestResult || !targetLocation) {
    return res.status(404).json({ error: 'Unable to calculate emergency route from current position' });
  }

  res.json({
    emergencyLocation: targetLocation,
    route: shortestResult,
  });
});

// User Path Reports
app.get('/api/path-reports', (_req, res) => {
  res.json(pathReports);
});

app.post('/api/path-reports', (req, res) => {
  const { pathId, locationName, problemType, description, severity, reporterName } = req.body;

  if (!locationName || !problemType || !description) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  const newReport: PathReport = {
    id: pathReports.length > 0 ? Math.max(...pathReports.map((r) => r.id)) + 1 : 1,
    pathId: pathId ? Number(pathId) : undefined,
    locationName: String(locationName),
    problemType: problemType || 'construction',
    description: String(description),
    status: 'PENDING',
    severity: severity || 'MEDIUM',
    reportedAt: new Date().toISOString(),
    reporterName: reporterName || 'Anonymous Student',
  };

  pathReports.unshift(newReport);
  res.status(201).json({
    message: 'Report submitted successfully. Campus security and facility administrators will review.',
    report: newReport,
  });
});

// Admin: Approve / Reject Reports
app.put('/api/path-reports/:id/approve', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const report = pathReports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = 'APPROVED';

  // If associated with a path or location, block the path
  if (report.pathId) {
    const targetPath = paths.find((p) => p.id === report.pathId);
    if (targetPath) {
      targetPath.isBlocked = true;
      targetPath.blockedReason = `${report.problemType.toUpperCase()}: ${report.description}`;
    }
  } else if (report.locationName.includes('CSE') || report.locationName.includes('Plaza')) {
    // Automatically correlate to Central-to-CSE path for demo
    const p112 = paths.find((p) => p.id === 112);
    if (p112) {
      p112.isBlocked = true;
      p112.blockedReason = report.description;
    }
  }

  res.json({ message: 'Report approved and navigation graph updated.', report });
});

app.put('/api/path-reports/:id/reject', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const report = pathReports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.status = 'REJECTED';
  res.json({ message: 'Report dismissed.', report });
});

// Admin: Toggle Path Block directly
app.post('/api/paths/:id/toggle-block', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pathObj = paths.find((p) => p.id === id);

  if (!pathObj) {
    return res.status(404).json({ error: 'Path not found' });
  }

  pathObj.isBlocked = !pathObj.isBlocked;
  if (pathObj.isBlocked) {
    pathObj.blockedReason = req.body.reason || 'Manual maintenance restriction set by Administrator';
  } else {
    pathObj.blockedReason = undefined;
  }

  res.json({
    message: `Path #${id} is now ${pathObj.isBlocked ? 'BLOCKED' : 'OPEN'}`,
    path: pathObj,
  });
});

// Admin Overview
app.get('/api/admin/overview', (_req, res) => {
  res.json({
    totalBuildings: buildings.length,
    totalNodes: nodes.length,
    totalPaths: paths.length,
    blockedPaths: paths.filter((p) => p.isBlocked).length,
    pendingReports: pathReports.filter((r) => r.status === 'PENDING').length,
    totalFacilities: facilities.length,
  });
});

// Reset Demo Data
app.post('/api/admin/reset-demo', (_req, res) => {
  paths = JSON.parse(JSON.stringify(INITIAL_PATHS));
  pathReports = [...INITIAL_REPORTS];
  res.json({ message: 'Demo graph and reports reset to initial seeded state' });
});

// ==========================================
// 4. Vite Dev Server / Static Hosting
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusLens Engine] Full-stack navigation server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
