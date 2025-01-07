import User from "../models/userModel";

/**
 * Checks if a user with the given username or email already exists.
 * @param username - The username to check.
 * @param email - The email to check.
 * @returns A promise resolving to true if a duplicate exists, false otherwise.
 */
export const checkDuplicateUser = async (
  username: string,
  email: string
): Promise<boolean> => {
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  return !!existingUser; // Convert the result to a boolean
};
