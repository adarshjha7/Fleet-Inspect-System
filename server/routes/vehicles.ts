import { RequestHandler } from "express";
import { fleetDB } from "../database/db";

// GET /api/vehicles - Get all vehicles
export const getVehicles: RequestHandler = async (req, res) => {
  try {
    const vehicles = await fleetDB.getVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
};

// GET /api/vehicles/:id - Get vehicle by ID
export const getVehicleById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await fleetDB.getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
};

// PUT /api/vehicles/:id - Update vehicle
export const updateVehicle: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const success = await fleetDB.updateVehicle(id, updates);

    if (!success) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const updatedVehicle = await fleetDB.getVehicleById(id);
    res.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ error: "Failed to update vehicle" });
  }
};
