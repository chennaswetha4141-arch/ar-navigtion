# CampusLens: AR-Based Campus Navigation App

> **“Find your way. Explore your campus.”**
> An innovative, full-stack, AR-assisted college campus navigation system with real-time Dijkstra shortest-path calculations, multi-floor indoor wayfinding, wheelchair-accessible routing, dynamic obstruction rerouting, and emergency rescue dispatch.

---

## 📌 Problem Statement

College campuses are expanding rapidly, featuring sprawling multi-acre grounds, multi-story faculty blocks, and labyrinthine department wings. New students, visiting professors, guests, and emergency services face persistent hurdles:

- Finding specific laboratories, classrooms, seminar halls, and administrative desks.
- Getting lost between outdoor quads and multi-floor indoor stairwells or elevators.
- Inaccessible routes for wheelchair users or students with mobility impairments.
- Unannounced path closures, construction barricades, or broken walkways with no dynamic detour options.
- Critical delays reaching medical rooms or security checkpoints during campus emergencies.

**CampusLens answers the core question:**
> *“I am here. I want to go there. What is the best, safest, and fastest way to reach it?”*

---

## 🌟 Key Innovations & Features

1. **Graph-Based Dijkstra Navigation Engine**:
   - Represents the college as a weighted directed graph of nodes (entrances, junctions, hallways, stairs, elevators, rooms) and edges (walkways, corridors).
   - Computes the shortest distance in meters, estimated walking time (~75m/min pace with floor transition weighting), and turn-by-turn guidance.

2. **Holographic AR Visual Navigation Prototype Layer**:
   - Camera-style first-person overlay with large 3D directional arrows (*“GO STRAIGHT”*, *“TURN LEFT”*, *“TAKE ELEVATOR TO FLOOR 1”*).
   - Real-time remaining distance meter, floating 3D waypoint beacon, compass heading, and simulated auto-walk mode for hackathon judging.
   - Dual-mode support: Seamlessly switches between live device camera (`getUserMedia`) and high-resolution synthesized campus POV photography for environments without webcam permissions.

3. **Multi-Floor Indoor Navigation**:
   - True vertical indoor routing covering Ground Floor, 1st Floor, and 2nd Floor.
   - Coordinates transitions between outdoor pathways, building atriums, central stairwells, and ADA elevators.

4. **Wheelchair-Accessible Route Mode (ADA Compliant)**:
   - When enabled, the algorithm strictly avoids stairs and steps, rerouting pedestrians through certified ADA ramps and elevators.
   - Transparently compares normal vs. accessible distances (e.g. *“Normal: 350 m vs Accessible: 420 m via Elevator B”*).

5. **Dynamic Obstruction Detection & Automatic Rerouting**:
   - When a walkway is obstructed by construction, events, or maintenance, the system detects the block and automatically recalculates an alternative detour (e.g., East Quad Shaded Bypass) with instant UI feedback:
     *⚠️ Path blocked! Finding an alternative route... Alternative route found (+75m)*.

6. **1-Click Emergency SOS Evacuation**:
   - Dedicated rapid-response buttons for Campus Health Center & Triage, Security Command Headquarters, Emergency Exits, and Blue-Light Police Intercoms.
   - Calculates the closest emergency facility from the user's current GPS position and launches evacuation guidance immediately.

7. **User Obstruction Reporting & Admin Console**:
   - Students report blocked roads, hazards, or construction with severity and location.
   - Administrators review reports with 1-click approval (which automatically updates the live graph in real-time) or toggle path blocks manually.

8. **Hackathon Judge Demonstration Panel**:
   - Built-in 7-stage 1-click test sequence allowing judges to evaluate every requirement in under 2 minutes.

---

## 🏗️ Architecture & Technology Stack

### Full-Stack Architecture
```
                         ┌──────────────────────────────────────────────┐
                         │              React 19 Frontend               │
                         │    (CampusMap, ARView, Search, RoutePanel)   │
                         └──────────────────────┬───────────────────────┘
                                                │ REST API (JSON)
                         ┌──────────────────────┴───────────────────────┐
                         │         REST API / Routing Engine            │
                         ├──────────────────────────────────────────────┤
                         │  Spring Boot 3.x (Java 17) / Express (Dev)   │
                         │   - Dijkstra Shortest Path Algorithm         │
                         │   - Obstruction & Graph Recalculation        │
                         │   - ADA Barrier-Free Routing Filter          │
                         │   - Emergency Nearest Distance Evaluator     │
                         └──────────────────────┬───────────────────────┘
                                                │ JPA / Hibernate / SQL
                         ┌──────────────────────┴───────────────────────┐
                         │           Database Layer (MySQL 8 / H2)      │
                         │ (Buildings, Facilities, Nodes, Paths, Reports)│
                         └──────────────────────────────────────────────┘
```

### Technology Breakdown

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons | Responsive mobile-first UI, SVG Interactive Campus Map, AR HUD |
| **Backend** | Java 17+, Spring Boot 3.2.x, Maven, REST APIs | Core enterprise routing services, Dijkstra graph traversal |
| **Dev Environment** | Node.js, Express, `tsx`, Vite Middleware | Embedded full-stack dev server for immediate zero-config testing |
| **Database** | MySQL 8.x (with H2 in-memory compatibility) | Relational persistence for campus entities, nodes, and reports |
| **ORM** | Spring Data JPA / Hibernate | Object-relational mapping, data repositories |

---

## 🗄️ Database Design

### Key Tables & Entities

- **`buildings`**: id, name, code, category, floors, entrance_node_ids, description, open_hours.
- **`facilities`**: id, name, code, node_id, building_id, floor, department, category, features, status.
- **`navigation_nodes`**: id, name, building_id, floor, type, x, y, is_accessible, is_emergency, emergency_type.
- **`navigation_paths`**: id, source_node_id, destination_node_id, distance, is_indoor, is_stairs, is_elevator, is_accessible, is_blocked, blocked_reason.
- **`path_reports`**: id, path_id, location_name, problem_type, description, status, severity, reported_at, reporter_name.
- **`emergency_locations`**: id, name, type, node_id, building_name, contact_number, description.
- **`users`**: id, username, password, email, role (STUDENT, ADMIN).

---

## 📡 REST API Documentation

### 1. Calculate Route
- **POST** `/api/navigation/route`
- **Request Body:**
  ```json
  {
    "sourceNodeId": 1,
    "destinationNodeId": 14,
    "accessibleOnly": false
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "distance": 455,
    "estimatedTime": 6,
    "accessibleOnly": false,
    "isRerouted": false,
    "route": [
      "Main Campus Gate",
      "South Quad Junction",
      "Central Campus Plaza & Fountain",
      "CSE Block Main Entrance",
      "CSE Ground Floor Atrium",
      "CSE Central Stairwell",
      "CSE 1st Floor Landing",
      "AI & Machine Learning Lab"
    ],
    "instructions": [
      {
        "stepNumber": 1,
        "action": "straight",
        "text": "Depart from Main Campus Gate. Proceed toward South Quad Junction.",
        "distanceMeters": 180
      },
      {
        "stepNumber": 5,
        "action": "stairs_up",
        "text": "Take the central stairs up to Floor 1.",
        "distanceMeters": 60
      }
    ]
  }
  ```

### 2. Emergency Navigation
- **POST** `/api/emergency/route`
- **Request Body:**
  ```json
  {
    "sourceNodeId": 1,
    "emergencyType": "medical",
    "accessibleOnly": false
  }
  ```

### 3. Smart Search & Directory
- **GET** `/api/facilities/search?query=AI`
- **GET** `/api/buildings`
- **GET** `/api/nodes`
- **GET** `/api/paths`

### 4. Path Obstruction Reporting & Moderation
- **POST** `/api/path-reports` (Submit obstacle)
- **GET** `/api/path-reports` (List all reports)
- **PUT** `/api/path-reports/{id}/approve` (Approve report & block path)
- **POST** `/api/paths/{id}/toggle-block` (Toggle path blockage directly)

---

## 🚀 How to Run the Project

### Option A: Instant Live Full-Stack Dev Server (AI Studio / Local Node)
The project comes pre-configured with a unified full-stack server running Express + Vite on port 3000:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the application:**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---

### Option B: Deploying to Vercel (1-Click Ready)
The repository is pre-configured with `vercel.json` and a Serverless Function bridge in `api/index.ts`:

1. **Deploy with Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel
   ```
2. **Or Deploy via Vercel Web Dashboard (GitHub Import):**
   - Push your repository to GitHub.
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"** -> **"Import Git Repository"**.
   - **Framework Preset**: Vite (detected automatically).
   - **Root Directory**: `./` (default).
   - **Build Command**: `npm run build` (or `vite build`).
   - **Output Directory**: `dist` (default).
   - Click **Deploy**.

> **Note**: Even on static-only hosting without serverless execution, CampusLens includes an automatic fallback client-side Dijkstra engine (`src/services/localCampusEngine.ts`), ensuring 100% of routing, AR navigation, and demo features work without any server configuration!

---

### Option C: Spring Boot Backend + MySQL (Production Standalone)

#### 1. Setup MySQL Database
```sql
CREATE DATABASE campuslens_db;
CREATE USER 'campuslens_user'@'localhost' IDENTIFIED BY 'campuslens_pass';
GRANT ALL PRIVILEGES ON campuslens_db.* TO 'campuslens_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Configure `backend/src/main/resources/application.yml`
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/campuslens_db?useSSL=false&serverTimezone=UTC
    username: campuslens_user
    password: campuslens_pass
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
```
*(Note: If no MySQL credentials are provided, it automatically falls back to an embedded in-memory H2 database with zero configuration needed).*

#### 3. Build & Run Spring Boot
```bash
cd backend
mvn clean package
mvn spring-boot:run
```
The REST API server will run on `http://localhost:8080`.

#### 4. Run React Frontend
```bash
npm install
npm run build
npm run preview
```

---

## 🎓 Main Judge Demonstration Flow (14-Step Sequence)

1. **Open CampusLens**: Land on the home page with tagline *"Find your way. Explore your campus."*
2. **Search for Destination**: Open Directory & Search for *"AI Laboratory"* or click *"Start Navigation"*.
3. **Select Destination**: Choose **AI & ML Lab (Room 101, Floor 1)**.
4. **Show Campus Route**: The interactive SVG campus map highlights the shortest walking route in cyan.
5. **Display Distance & ETA**: Metric card displays distance (455m) and estimated time (~6 mins).
6. **Start Navigation**: Review turn-by-turn guidance steps.
7. **Open AR Navigation Mode**: Click **"Start AR Navigation"** to enter the holographic AR HUD.
8. **Show Directional Arrow**: Observe the animated 3D directional arrow (*"GO STRAIGHT"*, *"TURN LEFT"*, etc.).
9. **Demonstrate Indoor Navigation**: Watch the path enter CSE Atrium, take Central Stairs to Floor 1, and arrive at AI Lab.
10. **Enable Accessible Route**: Toggle **"Enable Accessible"**. Notice the stairs are bypassed, and the ADA elevator is utilized (+40m route).
11. **Demonstrate Blocked Path**: Click **"Simulate Blockage"** or click **Judge Demo -> Stage 03**.
12. **Show Automatic Rerouting**: Watch the system detect the blocked main walkway and instantly recalculate via the **East Quad Shaded Bypass**.
13. **Select Emergency Navigation**: Click **"Emergency SOS"** at top-right.
14. **Navigate to Medical Room**: Select **Medical Room & Triage Station** to immediately view the fastest evacuation route.

---

## 👥 Hackathon Credentials
- **Student Role**: Default visitor/student access for routing, AR, directory, and hazard reporting.
- **Admin Role**: Click **Admin** in the navigation bar to approve/dismiss obstruction reports and toggle path blocks.

---

## 🔮 Future Enhancements
- WebXR depth estimation for real-time 3D bounding boxes around lab doors.
- Bluetooth Low Energy (BLE) beacon integration for sub-meter indoor positioning.
- Multi-campus cross-shuttle bus scheduling integration.
- Voice-activated conversational campus guide using on-device speech models.
