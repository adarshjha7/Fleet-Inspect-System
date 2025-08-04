import { Vehicle, InspectionReport, MaintenanceAlert } from "@shared/fleet";

const API_BASE = "/api";

// Vehicle API
export const vehicleAPI = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE}/vehicles`);
    if (!response.ok) {
      throw new Error("Failed to fetch vehicles");
    }
    return response.json();
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE}/vehicles/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch vehicle");
    }
    return response.json();
  },

  update: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error("Failed to update vehicle");
    }
    return response.json();
  },
};

// Inspection Reports API
export const reportsAPI = {
  getAll: async (): Promise<InspectionReport[]> => {
    const response = await fetch(`${API_BASE}/reports`);
    if (!response.ok) {
      throw new Error("Failed to fetch reports");
    }
    return response.json();
  },

  create: async (
    report: Omit<InspectionReport, "id">,
  ): Promise<{ id: string; message: string }> => {
    const response = await fetch(`${API_BASE}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(report),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create report");
    }
    return response.json();
  },

  updateStatus: async (
    id: string,
    status: "pass" | "fail" | "pending",
  ): Promise<void> => {
    const response = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error("Failed to update report status");
    }
  },
};

// Maintenance Alerts API
export const alertsAPI = {
  getAll: async (): Promise<MaintenanceAlert[]> => {
    const response = await fetch(`${API_BASE}/alerts`);
    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }
    return response.json();
  },

  create: async (
    alert: Omit<MaintenanceAlert, "id">,
  ): Promise<{ id: string; message: string }> => {
    const response = await fetch(`${API_BASE}/alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alert),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create alert");
    }
    return response.json();
  },
};

// Health check
export const healthAPI = {
  ping: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/ping`);
    if (!response.ok) {
      throw new Error("Server is not responding");
    }
    return response.json();
  },
};
