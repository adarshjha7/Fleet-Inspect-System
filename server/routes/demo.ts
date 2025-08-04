import { RequestHandler } from "express";

export const handleDemo: RequestHandler = (req, res) => {
  res.json({
    message: "Demo endpoint working!",
    timestamp: new Date().toISOString(),
  });
};
