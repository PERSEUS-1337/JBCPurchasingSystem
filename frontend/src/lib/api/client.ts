"use client";

import Cookies from "js-cookie";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api";
const AUTH_COOKIE_KEY = "auth_token";

type RequestBody = BodyInit | object | null | undefined;

type RequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: RequestBody;
  headers?: HeadersInit;
  token?: string;
  requiresAuth?: boolean;
};

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL;
}

function getToken(): string | undefined {
  return Cookies.get(AUTH_COOKIE_KEY);
}

function isSerializableObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !(value instanceof FormData);
}

function parseBody(body?: RequestBody): BodyInit | undefined {
  if (!body) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams) {
    return body;
  }

  if (isSerializableObject(body)) {
    return JSON.stringify(body);
  }

  return body as BodyInit;
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);
  const token = options.token ?? getToken();

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requiresAuth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (isSerializableObject(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: buildHeaders(options),
    body: parseBody(options.body),
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new HttpError(
      getErrorMessage(payload, "Something went wrong while processing your request."),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export function setAuthToken(token: string): void {
  Cookies.set(AUTH_COOKIE_KEY, token, {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearAuthToken(): void {
  Cookies.remove(AUTH_COOKIE_KEY);
}

export function getAuthToken(): string | undefined {
  return getToken();
}

export function get<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "GET" });
}

export function post<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "POST", body });
}

export function put<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "PUT", body });
}

export function patch<T>(path: string, body?: RequestBody, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "PATCH", body });
}

export function del<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: "DELETE" });
}
