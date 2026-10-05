-- CampusLens University Database Schema & Demo Seed Data
-- Compatible with MySQL 8.x and H2 Database

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buildings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    floors VARCHAR(50),
    entrance_node_ids VARCHAR(50),
    description TEXT,
    open_hours VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    building_id BIGINT,
    building_name VARCHAR(150),
    floor INT NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL,
    x DOUBLE NOT NULL,
    y DOUBLE NOT NULL,
    is_accessible BOOLEAN NOT NULL DEFAULT TRUE,
    is_emergency BOOLEAN DEFAULT FALSE,
    emergency_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS navigation_paths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_node_id BIGINT NOT NULL,
    destination_node_id BIGINT NOT NULL,
    distance DOUBLE NOT NULL,
    is_indoor BOOLEAN NOT NULL DEFAULT FALSE,
    is_stairs BOOLEAN NOT NULL DEFAULT FALSE,
    is_elevator BOOLEAN NOT NULL DEFAULT FALSE,
    is_accessible BOOLEAN NOT NULL DEFAULT TRUE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_reason VARCHAR(255),
    floor INT NOT NULL DEFAULT 0,
    bidirectional BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    node_id BIGINT NOT NULL,
    building_id BIGINT,
    building_name VARCHAR(150),
    floor INT NOT NULL DEFAULT 0,
    department VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    features TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    description TEXT
);

CREATE TABLE IF NOT EXISTS emergency_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    node_id BIGINT NOT NULL,
    building_name VARCHAR(150),
    contact_number VARCHAR(100),
    description TEXT
);

CREATE TABLE IF NOT EXISTS path_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    path_id BIGINT,
    location_name VARCHAR(150) NOT NULL,
    problem_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reporter_name VARCHAR(100)
);

-- Default Demo Users
INSERT INTO users (id, username, password, email, role) VALUES
(1, 'student', 'student123', 'student@campuslens.edu', 'STUDENT'),
(2, 'admin', 'admin123', 'admin@campuslens.edu', 'ADMIN');
