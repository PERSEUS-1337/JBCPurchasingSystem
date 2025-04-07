import { Request, Response, NextFunction } from "express";
import Supply, { ISupply } from "../models/supplyModel";
import { sendError } from "../utils/responseUtils";

declare global {
  namespace Express {
    interface Request {
      supply?: ISupply;
    }
  }
}

/**
 * Middleware to check if a supply exists and attach it to the request
 * @param req Express Request object containing supplyID in params
 * @param res Express Response object
 * @param next Express NextFunction
 * @returns void
 * @throws 404 if supply not found
 * @throws 500 if server error occurs
 */
export const checkSupplyExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { supplyID } = req.params;
    const supply = await Supply.findOne({ supplyID });

    if (!supply) {
      sendError(res, 404, "Supply not found");
      return;
    }

    req.supply = supply;
    next();
  } catch (err: any) {
    sendError(res, 500, "Internal server error", err.message);
  }
};
