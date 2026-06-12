const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000";
export const API_BASE = RAW_BASE.replace(/\/$/, "");

const TOKEN_KEY = "taggy_token";
const USER_KEY = "taggy_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function setStoredUser(user: StoredUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function userFromToken(token: string): StoredUser {
  const claims = decodeJwt(token) ?? {};
  const id =
    claims.sub ??
    claims.nameid ??
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
    "";
  const email =
    claims.email ?? claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  const name =
    claims.name ??
    claims.unique_name ??
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
  return { id: String(id), email, name };
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.message || data.title || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

// ---------- Auth ----------
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  user?: StoredUser;
}

export async function login(payload: LoginPayload): Promise<string> {
  const data = await request<LoginResponse | string>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const token =
    typeof data === "string" ? data : (data.token ?? data.accessToken ?? data.jwt ?? "");
  if (!token) throw new ApiError("Token não retornado pelo servidor", 500);
  return token;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

// ---------- Vehicles ----------
export interface Vehicle {
  id: string;
  name: string;
  engineType: string;
  consumption?: number;
  co2Emission?: number;
}
export interface VehicleDto {
  name: string;
  engineType: string;
  consumption?: number;
  co2Emission?: number;
}

export function listVehicles() {
  return request<Vehicle[]>("/vehicles");
}
export function createVehicle(dto: VehicleDto) {
  return request<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(dto) });
}
export function updateVehicle(id: string, dto: VehicleDto) {
  return request(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(dto) });
}
export function deleteVehicle(id: string) {
  return request(`/vehicles/${id}`, { method: "DELETE" });
}

// ---------- Users ----------
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}
export interface EditUserDto {
  id: string;
  name: string;
  email: string;
  password?: string;
}
export function getUser(id: string) {
  return request<UserProfile>(`/users/${id}`);
}
export function updateUser(dto: EditUserDto) {
  return request("/users", { method: "PUT", body: JSON.stringify(dto) });
}

// ---------- Calculator ----------
export type Timescale = "Y" | "M" | "D";
export interface CalcQuery {
  Timescale: Timescale;
  Frequency: number;
  TimescaleValue: number;
}

function calcUrl(path: string, q: CalcQuery) {
  const params = new URLSearchParams({
    Timescale: q.Timescale,
    Frequency: String(q.Frequency),
    TimescaleValue: String(q.TimescaleValue),
  });
  return `${path}?${params.toString()}`;
}

// API returns number or { value } — normalize
function asNumber(v: any): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object") {
    for (const k of ["value", "result", "amount", "total"]) {
      if (typeof v[k] === "number") return v[k];
    }
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function getEmission(q: CalcQuery): Promise<{ totalValue: number }> {
  return await request(calcUrl("/emission", q));
}
export async function getFuelSaving(q: CalcQuery): Promise<{ totalValue: number }> {
  return await request(calcUrl("/fuel-saving", q));
}
export async function getPaperEmission(q: CalcQuery): Promise<{ totalValue: number }> {
  return await request(calcUrl("/paper-emission", q));
}

// ---------- Series (progression over time) ----------
// NOTE: endpoints below are placeholders — backend will provide real ones.
// For now we mock a linear progression based on the current query.
export interface SeriesPoint {
  label: string;
  value: number;
}

function timescaleLabel(t: Timescale, i: number): string {
  if (t === "Y") return `Ano ${i + 1}`;
  if (t === "M") return `Mês ${i + 1}`;
  return `Dia ${i + 1}`;
}

async function fetchSeries(path: string, q: CalcQuery, factor: number): Promise<SeriesPoint[]> {
  try {
    console.log({ path, q, factor });

    const data = await request<any>(calcUrl(path, q));

    console.log({ data });
    if (Array.isArray(data)) {
      return data.map((d, i) => ({
        label: d.label ?? d.name ?? timescaleLabel(q.Timescale, i),
        value: asNumber(d.value ?? d),
      }));
    }
  } catch {
    const points = 10;
    const perUnit = q.Frequency * (q.Timescale === "Y" ? 365 : q.Timescale === "M" ? 30 : 1);
    return Array.from({ length: points }, (_, i) => ({
      label: timescaleLabel(q.Timescale, i),
      value: perUnit * (i + 1) * factor,
    }));
  }
}

export function getEmissionSeries(q: CalcQuery) {
  return fetchSeries("/emission-series", q, 0.012);
}
export function getFuelSavingSeries(q: CalcQuery) {
  return fetchSeries("/fuel-saving-series", q, 0.05);
}
export function getPaperEmissionSeries(q: CalcQuery) {
  return fetchSeries("/paper-emission-series", q, 0.45);
}

export async function downloadEsgReport(data: {
  emission: number;
  fuel: number;
  paper: number;
  frequency: number;
}): Promise<void> {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/download/pdf`, {
    method: "POST",
    headers: {
      ...Object.fromEntries(headers.entries()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    const msg = text || `Download failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio-esg.pdf";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
