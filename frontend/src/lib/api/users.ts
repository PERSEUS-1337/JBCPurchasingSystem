import { ApiResponse } from "../types/api";
import { User, UserAdminView } from "../types/user";
import { del, get, put } from "./client";

type UpdateUserPayload = {
  fullname?: string;
  email?: string;
  position?: string;
  department?: string;
};

export function getMe() {
  return get<ApiResponse<User>>("/user/me");
}

export function getAllUsers() {
  return get<ApiResponse<UserAdminView[] | null>>("/user/");
}

export function getUserById(userID: string) {
  return get<ApiResponse<UserAdminView>>(`/user/${userID}`);
}

export function updateUser(userID: string, payload: UpdateUserPayload) {
  return put<ApiResponse<UserAdminView | User>>(`/user/${userID}`, payload);
}

export function deleteUser(userID: string) {
  return del<ApiResponse<UserAdminView>>(`/user/${userID}`);
}
