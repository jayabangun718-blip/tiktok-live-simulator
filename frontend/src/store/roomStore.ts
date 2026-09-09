import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { storage } from "@/src/utils/storage";

const CACHE_KEY = "@room_state_cache_v1";

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

async function postJSON(url: string, body?: any, method = "POST") {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export function useRoom() {
  const [state, setState] = useState<RoomState | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1) Show cached state instantly (works even fully offline).
    storage.getItem(CACHE_KEY, "").then((raw) => {
      if (raw) {
        try {
          setState((cur) => cur ?? (JSON.parse(raw as string) as RoomState));
        } catch {}
      }
    });

    // 2) Try to fetch latest from server (ignored if offline).
    fetch(`${API}/room`)
      .then((r) => r.json())
      .then((d) => {
        setState(d);
        storage.setItem(CACHE_KEY, JSON.stringify(d));
      })
      .catch(() => {});

    // 3) Live updates + auto-reconnect when the network comes back.
    const socket = io(BACKEND, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("room_state", (data: RoomState) => {
      setState(data);
      storage.setItem(CACHE_KEY, JSON.stringify(data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const patchGuest = useCallback(
    (id: string, patch: Partial<GuestSlot>) =>
      postJSON(`${API}/room/guest/${id}`, patch, "PATCH"),
    [],
  );

  const patchHost = useCallback(
    (patch: Partial<HostSlot>) => postJSON(`${API}/room/host`, patch, "PATCH"),
    [],
  );

  const triggerLion = useCallback(
    (targetIdx: number) => postJSON(`${API}/room/lion`, { targetIdx }),
    [],
  );

  const resetRoom = useCallback(() => postJSON(`${API}/room/reset`), []);

  const authControl = useCallback(async (pin: string) => {
    const j = await postJSON(`${API}/control/auth`, { pin });
    return !!j?.ok;
  }, []);

  return {
    state,
    connected,
    patchGuest,
    patchHost,
    triggerLion,
    resetRoom,
    authControl,
  };
}
