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
                    if (idx === lionTargetIdx) {
                      return (
                        <View key={g.id} style={styles.guestCellWrap}>
                          <GuestBox
                            index={idx}
                            guest={g}
                            onPress={() =>
                              setEditing({ type: "guest", id: g.id })
                            }
                          />
                          {showLion ? (
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
                    return (
                      <GuestBox
                        key={g.id}
                        index={idx}
                        guest={g}
                        onPress={() =>
                          setEditing({ type: "guest", id: g.id })
                        }
                      />
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

/* ------------- small helpers ------------- */

function ActionIcon({
  icon,
  label,
  badge,
}: {
  icon: any;
  label: string;
  badge?: string;
}) {
  return (
    <Pressable style={styles.actionBtn} testID={`action-${label}`}>
      <View style={{ position: "relative" }}>
        <Ionicons name={icon} size={22} color="#fff" />
        {badge ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeTxt}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.actionLbl} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function MawarAction() {
  return (
    <Pressable style={styles.actionBtn} testID="action-mawar">
      <MDIcon name="rose" size={22} color="#FF4D8D" />
      <Text style={styles.actionLbl}>Mawar</Text>
    </Pressable>
  );
}

function GiftAction() {
  return (
    <Pressable style={styles.actionBtn} testID="action-hadiah">
      <MDIcon name="gift" size={22} color="#FF4D8D" />
      <Text style={styles.actionLbl}>hadiah</Text>
    </Pressable>
  );
}

function ShareAction({ label }: { label: string }) {
  return (
    <Pressable style={styles.actionBtn} testID="action-share">
      <Ionicons name="arrow-redo-outline" size={22} color="#fff" />
      <Text style={styles.actionLbl}>{label}</Text>
    </Pressable>
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
  /* ---------- Header ---------- */
  headerBlock: {
    paddingHorizontal: 8,
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
    gap: 4,
  },
  avatarRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  streamerName: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  heartCount: {
    color: colors.accentPink,
    fontSize: 10,
    fontWeight: "700",
  },
  giftPill: {
    marginLeft: 8,
    width: 44,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F3E8CE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F5B451",
  },
  giftPillInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  miniStack: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#08080B",
  },
  miniCount: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 2,
  },
  viewerBig: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 3,
  },
  chipsRow: {
    gap: 6,
    paddingVertical: 2,
    paddingRight: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  eventsRow: {
    gap: 8,
    paddingVertical: 8,
    paddingRight: 8,
    alignItems: "center",
  },
  eventTile: {
    minWidth: 44,
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  eventIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  eventBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#EF4444",
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.surface,
  },
  eventBadgeTxt: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800",
  },
  eventTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  eventSub: {
    color: colors.muted,
    fontSize: 9,
  },
  progressTrack: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 1,
    overflow: "hidden",
  },
  progressFill: {
    width: "44%",
    height: "100%",
    backgroundColor: colors.accentGreen,
  },
  legendTxt: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  rainbowIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  /* ---------- Feed ---------- */
  feedBlock: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "flex-end",
    gap: 6,
  },
  chatMsgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chatMsgAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  chatMsgPill: {
    maxWidth: "70%",
    backgroundColor: "rgba(30,30,36,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chatMsgTxt: {
    fontSize: 12,
  },
  sysRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 4,
  },
  sysIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sysBadgeTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  sysTxt: {
    color: "#fff",
    fontSize: 12,
    flexShrink: 1,
    lineHeight: 16,
  },
  /* ---------- Bottom bar ---------- */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 6,
    backgroundColor: colors.surface,
  },
  chatInput: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: "center",
    minWidth: 78,
  },
  chatInputTxt: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  actionLbl: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  actionBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadgeTxt: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
});
