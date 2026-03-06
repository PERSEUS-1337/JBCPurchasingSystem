import { ApiResponse } from "../types/api";
import { get, patch, post } from "./client";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult = {
  bearer: string;
};

type RefreshResult = {
  token: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export function login(payload: LoginPayload) {
  return post<ApiResponse<LoginResult>>("/auth/login", payload, {
    requiresAuth: false,
  });
}

export function logout() {
  return post<ApiResponse<null>>("/auth/logout", undefined, {
    requiresAuth: false,
  });
}

export function refreshToken() {
  return get<ApiResponse<RefreshResult>>("/auth/refresh", {
    requiresAuth: false,
  });
}

export function checkProtectedRoute() {
  return get<{ message: string }>("/auth/protected");
}

export function changePassword(payload: ChangePasswordPayload) {
  return patch<ApiResponse<null>>("/auth/change-pwd", payload);
}
