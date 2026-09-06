import Ionicons from "@react-native-vector-icons/ionicons";
import MDIcon from "@react-native-vector-icons/material-design-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
import { colors } from "@/src/theme";

type EditTarget =
  | { type: "host" }
  | { type: "guest"; id: string }
  | null;

export default function LiveRoomScreen() {
  const insets = useSafeAreaInsets();
  const { state, loaded, updateHost, updateGuest } = useSlotsStore();
  const [editing, setEditing] = useState<EditTarget>(null);

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

      {/* ============ TOP HEADER ============ */}
      <View style={styles.headerBlock}>
        {/* Row 1: streamer info */}
        <View style={styles.row1}>
          <View style={styles.avatarRing}>
            <LinearGradient
              colors={["#5AD3F5", "#2871E9"]}
              style={styles.avatarInner}
            />
          </View>
          <View style={{ flex: 0, marginLeft: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={styles.streamerName}>{state.host.name}</Text>
              <MDIcon name="flag" size={9} color="#E11D48" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Ionicons name="heart" size={9} color={colors.accentPink} />
              <Text style={styles.heartCount}>{state.host.hearts}</Text>
            </View>
          </View>

          {/* pill w/ heart-in-bubble */}
          <View style={styles.giftPill}>
            <View style={styles.giftPillInner}>
              <Ionicons name="heart" size={10} color="#FF4D8D" />
            </View>
          </View>

          {/* stacked mini avatars */}
          <View style={styles.miniStack}>
            <View style={[styles.miniAvatar, { backgroundColor: "#F5B451" }]} />
            <View
              style={[
                styles.miniAvatar,
                { backgroundColor: "#8C8C99", marginLeft: -8 },
              ]}
            />
          </View>
          <Text style={styles.miniCount}>231</Text>

          <View style={{ flex: 1 }} />

          <MDIcon name="account-outline" size={13} color="#fff" />
          <Text style={styles.viewerBig}>494</Text>
          <Pressable hitSlop={8} testID="close-btn" style={{ marginLeft: 8 }}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Row 2: category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <View style={[styles.catChip, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
            <View style={[styles.catDot, { backgroundColor: "#F5C044" }]} />
            <Text style={styles.catTxt}>Kehidupan Seh...</Text>
          </View>
          <View style={[styles.catChip, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
            <MDIcon name="diamond-stone" size={10} color="#22D3EE" />
            <Text style={styles.catTxt}>Liga D3 No. 3+</Text>
          </View>
          <View style={[styles.catChip, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
            <View style={[styles.catDot, { backgroundColor: "#D946EF" }]} />
            <Text style={styles.catTxt}>Jelajahi</Text>
            <Ionicons name="chevron-forward" size={10} color="#fff" />
          </View>
        </ScrollView>

        {/* Row 3: event tiles */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventsRow}
        >
          <View style={styles.eventTile}>
            <View style={[styles.eventIcon, { backgroundColor: "#6E3AC5" }]}>
              <MDIcon name="treasure-chest" size={16} color="#FFD24F" />
            </View>
            <Text style={styles.eventTxt}>04:24</Text>
          </View>

          <View style={styles.eventTile}>
            <View style={[styles.eventIcon, { backgroundColor: "#E64A6D" }]}>
              <MDIcon name="gift" size={16} color="#FFD24F" />
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeTxt}>2</Text>
              </View>
            </View>
            <Text style={styles.eventTxt}>03:10</Text>
          </View>

          <View style={[styles.eventTile, { minWidth: 74 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <MDIcon name="rose" size={16} color="#FF4D8D" />
              <Text style={styles.eventTxt}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>359</Text>
                <Text style={{ color: colors.muted }}>/820</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.eventSub}>2h00m</Text>
          </View>

          <View style={[styles.eventTile, { paddingHorizontal: 4 }]}>
            <Text style={styles.legendTxt}>Legends of</Text>
            <Text style={styles.legendTxt}>Match</Text>
          </View>

          <View style={styles.eventTile}>
            <LinearGradient
              colors={["#F59E0B", "#EC4899", "#8B5CF6", "#22D3EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rainbowIcon}
            />
          </View>
        </ScrollView>
      </View>

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

      {/* ============ CHAT / SYSTEM FEED ============ */}
      <View style={styles.feedBlock} pointerEvents="box-none">
        <View style={styles.chatMsgRow}>
          <View style={styles.chatMsgAvatar}>
            <LinearGradient
              colors={["#8AB6D6", "#3E5C7A"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={styles.chatMsgPill}>
            <Text style={styles.chatMsgTxt} numberOfLines={1}>
              <Text style={{ color: "#7DD3FC", fontWeight: "700" }}>
                yon tanjung
              </Text>
              <Text style={{ color: "#E5E7EB" }}> mengirim Say...</Text>
            </Text>
          </View>
          <MDIcon name="rose" size={16} color="#FF4D8D" style={{ marginLeft: 4 }} />
          <View style={{ flex: 1 }} />
          <Ionicons name="heart-outline" size={22} color="#FF4D8D" />
        </View>

        <View style={styles.chatMsgRow}>
          <View style={styles.chatMsgAvatar}>
            <LinearGradient
              colors={["#F59E0B", "#9A4A0F"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={styles.chatMsgPill}>
            <Text style={styles.chatMsgTxt} numberOfLines={1}>
              <Text style={{ color: "#FBBF24", fontWeight: "700" }}>
                HANNA. K...
              </Text>
              <Text style={{ color: "#E5E7EB" }}> mengirim Ma...</Text>
            </Text>
          </View>
          <MDIcon name="rose" size={16} color="#FF4D8D" style={{ marginLeft: 4 }} />
          <View style={{ flex: 1 }} />
          <Ionicons name="heart" size={22} color="#FF4D8D" />
        </View>

        {/* System msg 1 */}
        <View style={styles.sysRow}>
          <View style={styles.sysIcon}>
            <MDIcon name="diamond-stone" size={12} color="#7DD3FC" />
            <Text style={styles.sysBadgeTxt}>9</Text>
          </View>
          <View style={styles.sysIcon}>
            <Ionicons name="heart" size={11} color="#FF4D8D" />
            <Text style={styles.sysBadgeTxt}>1</Text>
          </View>
          <Text style={styles.sysTxt} numberOfLines={2}>
            <Text style={{ fontWeight: "700" }}>yon tanjung</Text> menjadi
            anggota No. 203 yang bergabung dengan tim
          </Text>
        </View>

        {/* System msg 2 */}
        <View style={styles.sysRow}>
          <View style={[styles.sysIcon, { backgroundColor: "#6E3AC5" }]}>
            <MDIcon name="treasure-chest" size={12} color="#FFD24F" />
          </View>
          <Text style={styles.sysTxt} numberOfLines={2}>
            <Text style={{ fontWeight: "700" }}>{state.host.name}</Text>{" "}
            mengirim Kotak Harta Karun dengan{" "}
            <MDIcon name="circle" size={11} color="#FBBF24" /> x 20
          </Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="heart" size={22} color="#FF4D8D" />
        </View>
      </View>

      {/* ============ BOTTOM ACTION BAR ============ */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
      >
        <View style={styles.chatInput}>
          <Text style={styles.chatInputTxt}>Berk...</Text>
        </View>

        <ActionIcon icon="videocam-off-outline" label="Kamera" />
        <ActionIcon icon="mic-off-outline" label="Mic" />
        <ActionIcon icon="people-outline" label="Multi-g..." badge="22" />
        <MawarAction />
        <GiftAction />
        <ShareAction label="896" />
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
    paddingHorizontal: 6,
    marginTop: 2,
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
