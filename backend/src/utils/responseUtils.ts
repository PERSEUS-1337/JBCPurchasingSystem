import { Response } from "express";

export const sendResponse = (
  res: Response,
  status: number,
  message: string,
  data?: any
) => {
  res.status(status).json({ message, data });
};

export const sendError = (
  res: Response,
  status: number,
  message: string,
  error?: any
) => {
  res.status(status).json({ message, error });
};
