import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepScreenAwake } from "@/src/hooks/useKeepScreenAwake";

import { EditSlotSheet, type EditPayload } from "@/src/components/EditSlotSheet";
import { useRoom } from "@/src/store/roomStore";
import { storage } from "@/src/utils/storage";
import { colors } from "@/src/theme";

const AUTH_KEY = "@control_authed_v1";

type EditTarget = { type: "host" } | { type: "guest"; id: string } | null;

export default function ControlPanel() {
  useKeepScreenAwake();
  const insets = useSafeAreaInsets();
  const { state, connected, patchGuest, patchHost, triggerLion, resetRoom, authControl } =
    useRoom();

  const [authed, setAuthed] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [target, setTarget] = useState(0);
  const [editing, setEditing] = useState<EditTarget>(null);

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem(AUTH_KEY, false);
      if (saved === true) setAuthed(true);
      setCheckedAuth(true);
    })();
  }, []);

  useEffect(() => {
    if (state) setTarget(state.lionTargetIdx ?? 0);
  }, [state?.lionTargetIdx]);

  const submitPin = async () => {
    const ok = await authControl(pin);
    if (ok) {
      setAuthed(true);
      setPinError(false);
      storage.setItem(AUTH_KEY, true);
    } else {
      setPinError(true);
    }
  };

  const editingGuest =
    editing?.type === "guest"
      ? state?.guests.find((g) => g.id === editing.id) ?? null
      : null;

  const handleSave = (payload: EditPayload) => {
    if (!editing) return;
    if (editing.type === "host") {
      patchHost({
        name: payload.name,
        photoUri: payload.photoUri,
        message: payload.message ?? "",
      });
    } else {
      patchGuest(editing.id, {
        name: payload.name,
        photoUri: payload.photoUri,
        bgPhotoUri: payload.bgPhotoUri ?? null,
        viewers: payload.viewers ?? 0,
      });
    }
    setEditing(null);
  };

  // -------- PIN gate --------
  if (!checkedAuth) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  if (!authed) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <View style={styles.pinCard}>
          <Ionicons name="lock-closed" size={28} color={colors.brandPrimary} />
          <Text style={styles.pinTitle}>Panel Kontrol</Text>
          <Text style={styles.pinSub}>Masukkan PIN untuk mengatur ruangan</Text>
          <TextInput
            style={[styles.pinInput, pinError && styles.pinInputError]}
            value={pin}
            onChangeText={(t) => {
              setPin(t.replace(/[^0-9]/g, ""));
              setPinError(false);
            }}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="••••"
            placeholderTextColor={colors.muted}
            maxLength={8}
            testID="control-pin-input"
            onSubmitEditing={submitPin}
          />
          {pinError && <Text style={styles.pinErr}>PIN salah, coba lagi</Text>}
          <Pressable style={styles.primaryBtn} onPress={submitPin} testID="control-pin-submit">
            <Text style={styles.primaryBtnTxt}>Masuk</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/")} testID="control-back-display">
            <Text style={styles.linkTxt}>Kembali ke tampilan</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // -------- Loading state --------
  if (!state) {
    return (
      <View style={styles.center}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  // -------- Control panel --------
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/")} hitSlop={10} testID="control-home-btn">
          <Ionicons name="tv-outline" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Panel Kontrol</Text>
        <View style={styles.connWrap}>
          <View
            style={[styles.dot, { backgroundColor: connected ? colors.success : colors.error }]}
            testID="control-conn-dot"
          />
          <Text style={styles.connTxt}>{connected ? "Terhubung" : "Terputus"}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Lion trigger */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Munculkan Singa</Text>
          <Text style={styles.cardSub}>Pilih kotak target, penonton naik +29.999</Text>
          <View style={styles.chipsRow}>
            {state.guests.map((g, i) => {
              const active = i === target;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => setTarget(i)}
                  style={[styles.chip, active && styles.chipActive]}
                  testID={`control-target-${i}`}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                    {`No ${i + 1}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={({ pressed }) => [styles.lionBtn, pressed && { opacity: 0.85 }]}
            onPress={() => triggerLion(target)}
            testID="control-lion-btn"
          >
            <Ionicons name="paw" size={18} color="#fff" />
            <Text style={styles.lionBtnTxt}>Munculkan Singa (No {target + 1})</Text>
          </Pressable>
        </View>

        {/* Host */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Host</Text>
          <View style={styles.rowItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName} numberOfLines={1}>
                {state.host.name}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {state.host.message || "—"}
              </Text>
            </View>
            <Pressable
              style={styles.editBtn}
              onPress={() => setEditing({ type: "host" })}
              testID="control-edit-host"
            >
              <Ionicons name="create-outline" size={16} color={colors.onSurface} />
              <Text style={styles.editTxt}>Edit</Text>
            </Pressable>
          </View>
        </View>

        {/* Guests */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Peserta</Text>
          {state.guests.map((g, i) => (
            <View key={g.id} style={styles.rowItem}>
              <View style={styles.badgeNo}>
                <Text style={styles.badgeNoTxt}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {g.name}
                </Text>
                <Text style={styles.rowMeta}>{g.viewers} penonton</Text>
              </View>
              <Pressable
                style={[styles.iconToggle, g.muted && styles.iconToggleActive]}
                onPress={() => patchGuest(g.id, { muted: !g.muted })}
                testID={`control-mute-${i}`}
              >
                <Ionicons
                  name={g.muted ? "mic-off" : "mic"}
                  size={16}
                  color={g.muted ? "#fff" : colors.muted}
                />
              </Pressable>
              <Pressable
                style={styles.editBtn}
                onPress={() => setEditing({ type: "guest", id: g.id })}
                testID={`control-edit-guest-${i}`}
              >
                <Ionicons name="create-outline" size={16} color={colors.onSurface} />
                <Text style={styles.editTxt}>Edit</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Danger */}
        <Pressable
          style={styles.resetBtn}
          onPress={() => resetRoom()}
          testID="control-reset-btn"
        >
          <Ionicons name="refresh" size={16} color={colors.error} />
          <Text style={styles.resetTxt}>Reset ke default</Text>
        </Pressable>
      </ScrollView>

      {/* Edit sheets */}
      <EditSlotSheet
        visible={editing?.type === "host"}
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
  center: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: { color: colors.onSurface, fontSize: 16, fontWeight: "800" },
  connWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  connTxt: { color: colors.muted, fontSize: 11, fontWeight: "600" },

  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.onSurface, fontSize: 14, fontWeight: "800" },
  cardSub: { color: colors.muted, fontSize: 11, marginTop: 2, marginBottom: 8 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipTxt: { color: colors.onSurfaceTertiary, fontSize: 12, fontWeight: "700" },
  chipTxtActive: { color: colors.onBrandPrimary },

  lionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 13,
    borderRadius: 999,
  },
  lionBtnTxt: { color: "#fff", fontSize: 14, fontWeight: "800" },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderColor: colors.divider,
  },
  badgeNo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNoTxt: { color: colors.onSurfaceTertiary, fontSize: 11, fontWeight: "700" },
  rowName: { color: colors.onSurface, fontSize: 13, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: 11, marginTop: 1 },
  iconToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconToggleActive: { backgroundColor: colors.error },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  editTxt: { color: colors.onSurface, fontSize: 12, fontWeight: "700" },

  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
    padding: 10,
  },
  resetTxt: { color: colors.error, fontSize: 12, fontWeight: "700" },

  // PIN
  pinCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinTitle: { color: colors.onSurface, fontSize: 18, fontWeight: "800", marginTop: 4 },
  pinSub: { color: colors.muted, fontSize: 12, textAlign: "center", marginBottom: 8 },
  pinInput: {
    width: "100%",
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinInputError: { borderColor: colors.error },
  pinErr: { color: colors.error, fontSize: 12 },
  primaryBtn: {
    width: "100%",
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnTxt: { color: colors.onBrandPrimary, fontSize: 14, fontWeight: "800" },
  linkTxt: { color: colors.muted, fontSize: 12, marginTop: 10, textDecorationLine: "underline" },
});
