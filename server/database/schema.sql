-- FleetInspect Database Schema

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    bus_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'pending')),
    last_inspection_date TEXT,
    odometer_reading INTEGER,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    has_defects BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inspection reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    date TEXT NOT NULL,
    odometer_reading INTEGER NOT NULL,
    check_tires BOOLEAN DEFAULT FALSE,
    check_brakes BOOLEAN DEFAULT FALSE,
    check_lights BOOLEAN DEFAULT FALSE,
    check_fluids BOOLEAN DEFAULT FALSE,
    defect_description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pass', 'fail')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
);

-- Maintenance alerts table
CREATE TABLE IF NOT EXISTS maintenance_alerts (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    bus_number TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('failed_inspection', 'pending_maintenance', 'overdue_inspection')),
    severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
);

-- Files table for storing inspection photos/videos
CREATE TABLE IF NOT EXISTS inspection_files (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_data TEXT NOT NULL, -- Base64 encoded file data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES inspection_reports (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_bus_number ON vehicles (bus_number);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_vehicle_id ON inspection_reports (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_date ON inspection_reports (date);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_vehicle_id ON maintenance_alerts (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_resolved ON maintenance_alerts (resolved);
CREATE INDEX IF NOT EXISTS idx_inspection_files_inspection_id ON inspection_files (inspection_id);

-- Insert sample data (vehicles)
INSERT OR IGNORE INTO vehicles (id, bus_number, status, last_inspection_date, odometer_reading, model, year, has_defects) VALUES
    ('1', 'BUS-001', 'pass', '2024-01-15', 45200, 'Transit Connect', 2022, FALSE),
    ('2', 'BUS-002', 'fail', '2024-01-14', 52800, 'Transit Van', 2021, TRUE),
    ('3', 'BUS-003', 'pass', '2024-01-16', 38900, 'Transit Connect', 2023, FALSE),
    ('4', 'BUS-004', 'pending', '2024-01-10', 61200, 'Transit Van', 2020, FALSE),
    ('5', 'BUS-005', 'fail', '2024-01-13', 47600, 'Transit Connect', 2022, TRUE),
    ('6', 'BUS-006', 'pass', '2024-01-17', 33400, 'Transit Van', 2023, FALSE);
