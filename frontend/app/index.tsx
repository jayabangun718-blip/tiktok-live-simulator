import Ionicons from "@react-native-vector-icons/ionicons";
import MDIcon from "@react-native-vector-icons/material-design-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditSlotSheet, type EditPayload } from "@/src/components/EditSlotSheet";
import { AddRequestBox, GuestBox } from "@/src/components/GuestBox";
import { HostBox } from "@/src/components/HostBox";
import { useSlotsStore } from "@/src/store/slotsStore";
import { storage } from "@/src/utils/storage";
import { colors } from "@/src/theme";

type EditTarget =
  | { type: "host" }
  | { type: "guest"; id: string }
  | null;

export default function LiveRoomScreen() {
  const insets = useSafeAreaInsets();
  const { state, loaded, updateHost, updateGuest } = useSlotsStore();
  const [editing, setEditing] = useState<EditTarget>(null);
  const [showLion, setShowLion] = useState(false);
  const [lionTargetIdx, setLionTargetIdx] = useState(0);
  const lionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem("@lion_target_idx", 0);
      if (typeof saved === "number" && saved >= 0) setLionTargetIdx(saved);
    })();
    return () => {
      if (lionTimer.current) clearTimeout(lionTimer.current);
    };
  }, []);

  const selectLionTarget = (i: number) => {
    setLionTargetIdx(i);
    storage.setItem("@lion_target_idx", i);
  };

  const triggerLion = () => {
    if (lionTimer.current) clearTimeout(lionTimer.current);
    setShowLion(true);
    lionTimer.current = setTimeout(() => setShowLion(false), 2000);
  };

  if (!loaded) {
    return (
      <View style={styles.loadingRoot}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  const editingHost = editing?.type === "host";
  const editingGuest =
    editing?.type === "guest"
      ? state.guests.find((g) => g.id === editing.id) ?? null
      : null;

  const handleSave = (payload: EditPayload) => {
    if (!editing) return;
    if (editing.type === "host") {
      updateHost({
        name: payload.name,
        photoUri: payload.photoUri,
        message: payload.message ?? state.host.message,
      });
    } else {
      updateGuest(editing.id, {
        name: payload.name,
        photoUri: payload.photoUri,
        bgPhotoUri: payload.bgPhotoUri ?? null,
        viewers: payload.viewers ?? 0,
      });
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* ============ GRID: Host + Guests ============ */}
      <View style={styles.gridWrap}>
        <View style={styles.grid}>
          {/* Left: Host */}
          <HostBox
            host={state.host}
            onPress={() => setEditing({ type: "host" })}
          />

          {/* Right: 4 rows x 2 columns */}
          <View style={styles.guestsCol}>
            {[0, 1, 2, 3].map((row) => (
              <View key={row} style={styles.guestRow}>
                {[0, 1].map((col) => {
                  const idx = row * 2 + col;
                  if (idx < state.guests.length) {
                    const g = state.guests[idx];
                    return (
                      <View key={g.id} style={styles.guestCellWrap}>
                        <GuestBox
                          index={idx}
                          guest={g}
                          onPress={() =>
                            setEditing({ type: "guest", id: g.id })
                          }
                        />
                        {showLion && idx === lionTargetIdx ? (
                          <View
                            style={styles.lionOverlay}
                            pointerEvents="none"
                            testID="lion-flash-overlay"
                          >
                            <Image
                              source={require("../assets/images/lion.png")}
                              style={styles.lionImg}
                              contentFit="contain"
                              transition={0}
                            />
                          </View>
                        ) : null}
                      </View>
                    );
                  }
                  return <AddRequestBox key={`add-${idx}`} />;
                })}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ============ BOTTOM: SETTINGS + BUTTON ============ */}
      <View style={[styles.bottomBar2, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Kotak singa:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsRow2}
          >
            {state.guests.map((g, i) => {
              const active = i === lionTargetIdx;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => selectLionTarget(i)}
                  style={[styles.chip, active && styles.chipActive]}
                  testID={`lion-target-${i}`}
                >
                  <Text
                    style={[styles.chipTxt, active && styles.chipTxtActive]}
                    numberOfLines={1}
                  >
                    {`No ${i + 1}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.lionBtn,
            pressed && styles.lionBtnPressed,
          ]}
          onPress={triggerLion}
          testID="lion-flash-btn"
        >
          <Ionicons name="paw" size={18} color="#fff" />
          <Text style={styles.lionBtnTxt}>Munculkan Singa</Text>
        </Pressable>
      </View>

      {/* ============ EDIT SHEET ============ */}
      <EditSlotSheet
        visible={editingHost}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        title="Ubah Host"
        showMessage
        initial={{
          name: state.host.name,
          photoUri: state.host.photoUri,
          message: state.host.message,
        }}
      />
      <EditSlotSheet
        visible={!!editingGuest}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        title="Ubah Peserta"
        showViewers
        showBgPhoto
        initial={{
          name: editingGuest?.name ?? "",
          photoUri: editingGuest?.photoUri ?? null,
          bgPhotoUri: editingGuest?.bgPhotoUri ?? null,
          viewers: editingGuest?.viewers ?? 0,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  /* ---------- Grid ---------- */
  gridWrap: {
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 12,
  },
  grid: {
    aspectRatio: 1,
    flexDirection: "row",
    gap: 3,
  },
  guestsCol: {
    flex: 1,
    gap: 3,
  },
  guestRow: {
    flex: 1,
    flexDirection: "row",
    gap: 3,
  },
  guestCellWrap: {
    flex: 1,
    position: "relative",
  },
  lionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 0,
    paddingRight: 0,
  },
  lionImg: {
    width: "52%",
    height: "52%",
  },
  bottomBar2: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.surface,
  },
  lionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingVertical: 14,
    minHeight: 48,
  },
  lionBtnPressed: {
    opacity: 0.85,
  },
  lionBtnTxt: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  settingsLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  chipsScroll: {
    flex: 1,
  },
  chipsRow2: {
    gap: 6,
    paddingRight: 8,
    alignItems: "center",
  },
  chip: {
    minWidth: 40,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipTxt: {
    color: colors.onSurface,
    fontSize: 13,
    fontWeight: "700",
    maxWidth: 90,
  },
  chipTxtActive: {
    color: colors.onBrandPrimary,
  },
});
