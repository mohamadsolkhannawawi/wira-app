import { Request, Response } from "express";
import { analyzeLocationDummy } from "../services/aiMockService";

export const getAnalysis = async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    // Panggil dummy service
    const result = await analyzeLocationDummy(requestData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
