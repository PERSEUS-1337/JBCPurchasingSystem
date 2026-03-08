import { z } from "zod";

/**
 * PR Status Enums (must match prModel.ts)
 */
export const PR_STATUS = {
  DRAFT: "Draft",
  RECOMMENDED: "Recommended",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

export type PRStatus = (typeof PR_STATUS)[keyof typeof PR_STATUS];

/**
 * Valid status transition map
 * Defines which status transitions are allowed
 */
export const VALID_STATUS_TRANSITIONS: Record<PRStatus, PRStatus[]> = {
  [PR_STATUS.DRAFT]: [PR_STATUS.SUBMITTED, PR_STATUS.CANCELLED],
  [PR_STATUS.SUBMITTED]: [
    PR_STATUS.RECOMMENDED,
    PR_STATUS.REJECTED,
    PR_STATUS.CANCELLED,
  ],
  [PR_STATUS.RECOMMENDED]: [
    PR_STATUS.APPROVED,
    PR_STATUS.REJECTED,
    PR_STATUS.CANCELLED,
  ],
  [PR_STATUS.APPROVED]: [],
  [PR_STATUS.REJECTED]: [PR_STATUS.DRAFT],
  [PR_STATUS.CANCELLED]: [],
};

/**
 * Validate if a status transition is allowed
 */
export const isValidTransition = (
  currentStatus: PRStatus,
  newStatus: PRStatus,
): boolean => {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

/**
 * Get error message for invalid transition
 */
export const getTransitionErrorMessage = (
  currentStatus: PRStatus,
  newStatus: PRStatus,
): string => {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.join(", ") || "None"}`;
};

/**
 * Schema for updating PR status
 */
export const prStatusUpdateSchema = z.object({
  prStatus: z.enum([
    PR_STATUS.DRAFT,
    PR_STATUS.RECOMMENDED,
    PR_STATUS.SUBMITTED,
    PR_STATUS.APPROVED,
    PR_STATUS.REJECTED,
    PR_STATUS.CANCELLED,
  ]),
  recommendedBy: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
  rejectionReason: z.string().trim().optional(),
  cancellationReason: z.string().trim().optional(),
  changedBy: z.string().trim().optional(),
});

/**
 * Schema for cancelling a PR with reason
 */
export const prCancellationSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(1, "Cancellation reason is required"),
  cancelledBy: z.string().trim().min(1, "Cancelled by user ID is required"),
});

/**
 * Validate status update business rules
 */
export const validateStatusUpdateRules = (
  currentStatus: PRStatus,
  updateData: z.infer<typeof prStatusUpdateSchema>,
  currentRecommendedBy?: string,
): { valid: boolean; error?: string } => {
  const {
    prStatus: newStatus,
    recommendedBy,
    approvedBy,
    rejectionReason,
    cancellationReason,
  } = updateData;

  // Rule 1: Validate transition is allowed
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      valid: false,
      error: getTransitionErrorMessage(currentStatus, newStatus),
    };
  }

  // Rule 2: Recommended status requires recommendedBy
  if (newStatus === PR_STATUS.RECOMMENDED && !recommendedBy) {
    return {
      valid: false,
      error:
        "recommendedBy is required when transitioning to Recommended status",
    };
  }

  // Rule 3: Approved status requires both recommendedBy and approvedBy
  if (newStatus === PR_STATUS.APPROVED) {
    const hasRecommender = recommendedBy || currentRecommendedBy;
    if (!hasRecommender) {
      return {
        valid: false,
        error:
          "Purchase request must be recommended before it can be approved (recommendedBy required)",
      };
    }
    if (!approvedBy) {
      return {
        valid: false,
        error: "approvedBy is required when transitioning to Approved status",
      };
    }
  }

  // Rule 4: Rejected status should have rejectionReason
  if (newStatus === PR_STATUS.REJECTED && rejectionReason === "") {
    return {
      valid: false,
      error: "rejectionReason cannot be an empty string",
    };
  }

  // Rule 5: Cancelled status requires cancellationReason
  if (newStatus === PR_STATUS.CANCELLED && !cancellationReason) {
    return {
      valid: false,
      error: "cancellationReason is required when cancelling a PR",
    };
  }

  return { valid: true };
};

/**
 * Check if a PR can be edited based on its status
 */
export const canEditPR = (status: PRStatus): boolean => {
  return status === PR_STATUS.DRAFT || status === PR_STATUS.SUBMITTED;
};

/**
 * Check if a PR can be deleted based on its status
 */
export const canDeletePR = (status: PRStatus): boolean => {
  return status === PR_STATUS.DRAFT;
};

export type PRStatusUpdateInput = z.infer<typeof prStatusUpdateSchema>;
export type PRCancellationInput = z.infer<typeof prCancellationSchema>;
