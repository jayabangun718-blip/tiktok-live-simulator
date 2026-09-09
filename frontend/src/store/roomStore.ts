import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { storage } from "@/src/utils/storage";

const CACHE_KEY = "@room_state_cache_v1";
// Local fallback PIN used only when the server is unreachable (offline).
const LOCAL_PIN = "1234";

const BACKEND =
  (process.env.EXPO_PUBLIC_BACKEND_URL as string) ||
  (typeof window !== "undefined" ? window.location.origin : "");
const API = `${BACKEND}/api`;

export type HostSlot = {
  name: string;
  message: string;
  photoUri: string | null;
  hearts: string;
};

export type GuestSlot = {
  id: string;
  name: string;
  viewers: number;
  photoUri: string | null;
  bgPhotoUri: string | null;
  muted: boolean;
};

export type RoomState = {
  host: HostSlot;
  guests: GuestSlot[];
  lionSeq: number;
  lionTargetIdx: number;
};

// The app is LOCAL-FIRST: it always opens with this state instantly, even with
// no internet and no server. Server sync is best-effort on top of this.
export const DEFAULT_STATE: RoomState = {
  host: {
    name: "JB_Rogers",
    message: "F0Lo yg duluan naik",
    photoUri: null,
    hearts: "260.9K",
  },
  guests: [
    { id: "g1", name: "Danton_", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
    { id: "g2", name: "RAGA_", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
    { id: "g3", name: "ALL", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
    { id: "g4", name: "Hunaepi", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
    { id: "g5", name: "JBS CHA_", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
    { id: "g6", name: "IsRa Rog_", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
    { id: "g7", name: "johan_kw1", viewers: 0, photoUri: null, bgPhotoUri: null, muted: true },
  ],
  lionSeq: 0,
  lionTargetIdx: 0,
};

// ---------------- Shared singleton store (survives navigation between screens) ----------------
let current: RoomState = DEFAULT_STATE;
let connected = false;
const listeners = new Set<() => void>();
let started = false;
let socket: Socket | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: RoomState, persist = true) {
  current = next;
  if (persist) storage.setItem(CACHE_KEY, JSON.stringify(next));
  emit();
}

function setConnected(c: boolean) {
  if (connected === c) return;
  connected = c;
  emit();
}

function fireServer(url: string, body?: any, method = "POST") {
  // Best-effort only — never blocks the UI, never throws when offline.
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {});
}

function ensureStarted() {
  if (started) return;
  started = true;

  // 1) Load last saved state from this device (works fully offline).
  storage.getItem(CACHE_KEY, "").then((raw) => {
    if (raw) {
      try {
        setState(JSON.parse(raw as string) as RoomState, false);
      } catch {}
    }
  });

  // 2) Best-effort: pull latest from server if it happens to be awake.
  fetch(`${API}/room`)
    .then((r) => r.json())
    .then((d) => setState(d))
    .catch(() => {});

  // 3) Optional live sync with other devices when the server is reachable.
  socket = io(BACKEND, {
    path: "/api/socket.io",
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  socket.on("connect", () => setConnected(true));
  socket.on("disconnect", () => setConnected(false));
  socket.on("room_state", (data: RoomState) => setState(data));
}

// ---------------- Mutations (local-first: apply instantly, sync best-effort) ----------------
export function patchGuest(id: string, patch: Partial<GuestSlot>) {
  setState({
    ...current,
    guests: current.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  });
  fireServer(`${API}/room/guest/${id}`, patch, "PATCH");
}

export function patchHost(patch: Partial<HostSlot>) {
  setState({ ...current, host: { ...current.host, ...patch } });
  fireServer(`${API}/room/host`, patch, "PATCH");
}

export function triggerLion(targetIdx: number) {
  setState({
    ...current,
    guests: current.guests.map((g, i) =>
      i === targetIdx ? { ...g, viewers: (g.viewers ?? 0) + 29999 } : g,
    ),
    lionTargetIdx: targetIdx,
    lionSeq: (current.lionSeq ?? 0) + 1,
  });
  fireServer(`${API}/room/lion`, { targetIdx });
}

export function resetRoom() {
  setState({ ...DEFAULT_STATE, lionSeq: 0, lionTargetIdx: 0 });
  fireServer(`${API}/room/reset`);
}

export async function authControl(pin: string) {
  // Prefer server PIN; if offline, fall back to the local PIN so the
  // control panel still works standalone.
  try {
    const res = await fetch(`${API}/control/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const j = await res.json();
    return !!j?.ok;
  } catch {
    return pin === LOCAL_PIN;
  }
}

export function useRoom() {
  const [, force] = useState(0);
  useEffect(() => {
    ensureStarted();
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    state: current,
    connected,
    patchGuest,
    patchHost,
    triggerLion,
    resetRoom,
    authControl,
  };
}
