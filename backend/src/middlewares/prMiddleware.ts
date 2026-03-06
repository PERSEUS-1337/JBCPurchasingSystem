import { Request, Response, NextFunction } from "express";
import PurchaseRequest, { IPurchaseRequest } from "../models/prModel";

declare global {
  namespace Express {
    interface Request {
      purchaseRequest?: IPurchaseRequest;
    }
  }
}

/**
 * Middleware to check if a purchase request exists and attach it to the request
 * @param req Express Request object containing prID in params
 * @param res Express Response object
 * @param next Express NextFunction
 * @returns void
 * @throws 404 if purchase request not found
 * @throws 500 if server error occurs
 */
export const checkPRExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prID } = req.params;
    const purchaseRequest = await PurchaseRequest.findOne({ prID });

    if (!purchaseRequest) {
      res.status(404).json({
        success: false,
        message: "Purchase request not found",
      });
      return;
    }

    req.purchaseRequest = purchaseRequest;
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
