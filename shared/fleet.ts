export interface Vehicle {
  id: string;
  busNumber: string;
  status: "pass" | "fail" | "pending";
  lastInspectionDate: string;
  odometerReading: number;
  model: string;
  year: number;
  hasDefects: boolean;
}

export interface SerializedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 encoded file data
}

export interface InspectionReport {
  id: string;
  vehicleId: string;
  inspectorName: string;
  date: string;
  odometerReading: number;
  checks: {
    tires: boolean;
    brakes: boolean;
    lights: boolean;
    fluids: boolean;
  };
  defectDescription?: string;
  photos: SerializedFile[];
  videos: SerializedFile[];
  status: "pass" | "fail";
}

export interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  busNumber: string;
  alertType: "failed_inspection" | "pending_maintenance" | "overdue_inspection";
  severity: "high" | "medium" | "low";
  message: string;
  date: string;
}
