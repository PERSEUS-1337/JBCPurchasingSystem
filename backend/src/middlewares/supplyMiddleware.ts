import { Request, Response, NextFunction } from "express";
import Supply from "../models/supplyModel";
import { sendError } from "../utils/responseUtils";

declare global {
  namespace Express {
    interface Request {
      supply?: any;
    }
  }
}

export const checkSupplyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supplyID } = req.params;
    const supply = await Supply.findOne({ supplyID });

    if (!supply) {
      return sendError(res, 404, "Supply not found");
    }

    req.supply = supply;
    next();
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};
