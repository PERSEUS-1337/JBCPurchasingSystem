import { validUser } from "./mockUsers";

export const validLoginData = {
  email: validUser.email,
  password: validUser.password,
};
export const nonExistentUserLoginData = {
  email: "nonExistentUser@example.com",
  password: validUser.password,
};
export const invalidEmailLoginData = {
  email: "invalid@example",
  password: "password123",
};
export const invalidPasswordLoginData = {
  email: validUser.email,
  password: "wrongpassword",
};

export const invalidToken: string = "invalid-token";
export const expiredToken: string =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2NzUyYTEwZWRjZWExMGQwNjlhNTU5ZGYiLCJpYXQiOjE3MzM4MTU4NDgsImV4cCI6MTczMzgxNjE0OH0.uTFHWMoVXIlV3ERhnLVFEZzfHCVeA77snM8B4KzwCps";

export const wrongOldPassword = "WrongOldPassword123";
export const newPassword = "NewPassword123!";

export const validChangePasswordData = {
  currentPassword: validUser.password,
  newPassword: newPassword,
};
export const wrongOldChangePasswordData = {
  currentPassword: wrongOldPassword,
  newPassword: newPassword,
};
