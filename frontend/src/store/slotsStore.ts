import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@live_room_slots_v1";

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
  muted: boolean;
};

export type SlotsState = {
  host: HostSlot;
  guests: GuestSlot[]; // 7 slots, plus a fixed "+ Permintaan" tile is rendered separately
};

const DEFAULT_STATE: SlotsState = {
  host: {
    name: "JB_Rogers",
    message: "F0Lo yg duluan naik",
    photoUri: null,
    hearts: "260.9K",
  },
  guests: [
    { id: "g1", name: "Danton_", viewers: 671, photoUri: null, muted: true },
    { id: "g2", name: "RAGA_", viewers: 464, photoUri: null, muted: true },
    { id: "g3", name: "ALL", viewers: 0, photoUri: null, muted: true },
    { id: "g4", name: "Hunaepi", viewers: 481, photoUri: null, muted: true },
    { id: "g5", name: "JBS CHA_", viewers: 585, photoUri: null, muted: true },
    { id: "g6", name: "IsRa Rog_", viewers: 677, photoUri: null, muted: true },
    { id: "g7", name: "johan_kw1", viewers: 32, photoUri: null, muted: true },
  ],
};

export function useSlotsStore() {
  const [state, setState] = useState<SlotsState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SlotsState;
          // Basic sanity: keep default shape if incomplete
          if (parsed?.host && Array.isArray(parsed?.guests)) {
            setState(parsed);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: SlotsState) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const updateHost = useCallback(
    (patch: Partial<HostSlot>) => {
      persist({ ...state, host: { ...state.host, ...patch } });
    },
    [state, persist],
  );

  const updateGuest = useCallback(
    (id: string, patch: Partial<GuestSlot>) => {
      persist({
        ...state,
        guests: state.guests.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      });
    },
    [state, persist],
  );

  const resetAll = useCallback(() => {
    persist(DEFAULT_STATE);
  }, [persist]);

  return { state, loaded, updateHost, updateGuest, resetAll };
}
