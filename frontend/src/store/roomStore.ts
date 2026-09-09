import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

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
    fetch(`${API}/room`)
      .then((r) => r.json())
      .then((d) => setState(d))
      .catch(() => {});

    const socket = io(BACKEND, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("room_state", (data: RoomState) => setState(data));

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
