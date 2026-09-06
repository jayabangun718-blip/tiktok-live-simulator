import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import type { GuestSlot } from "@/src/store/slotsStore";

type Props = {
  guest: GuestSlot;
  onPress: () => void;
  index: number;
};

const GRADIENTS: [string, string][] = [
  ["#3E2A2A", "#1A1417"],
  ["#3A2E2E", "#1B1214"],
  ["#233238", "#0F1719"],
  ["#2C2A38", "#141220"],
  ["#332020", "#180F10"],
  ["#2A2A32", "#12121A"],
  ["#3A2620", "#1A100E"],
  ["#282430", "#12101A"],
];

function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function GuestBox({ guest, onPress, index }: Props) {
  const initial = (guest.name?.trim()?.[0] ?? "?").toUpperCase();
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      testID={`guest-box-${guest.id}`}
      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
    >
      {/* Large background: soft-blurred bg photo or dim gradient */}
      {guest.bgPhotoUri ? (
        <>
          <Image
            source={{ uri: guest.bgPhotoUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={6}
          />
          <View style={styles.dimOverlay} />
        </>
      ) : (
        <LinearGradient colors={gradient} style={StyleSheet.absoluteFill}>
          <View style={styles.dimOverlay} />
        </LinearGradient>
      )}

      {/* Small circular avatar in the center */}
      <View style={styles.avatarCircle}>
        {guest.photoUri ? (
          <Image
            source={{ uri: guest.photoUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.avatarInitial}>{initial}</Text>
        )}
      </View>

      {/* Viewer count top-left */}
      <View style={styles.viewerRow}>
        <View style={styles.viewerDot} />
        <Text style={styles.viewerTxt}>{formatViewers(guest.viewers)}</Text>
      </View>

      {/* Bottom bar: name + mute icon */}
      <View style={styles.bottomRow}>
        <Text style={styles.nameTxt} numberOfLines={1}>
          {guest.name}
        </Text>
        {guest.muted && (
          <Ionicons name="volume-mute" size={11} color="rgba(255,255,255,0.7)" />
        )}
      </View>
    </Pressable>
  );
}

export function AddRequestBox({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      style={[styles.container, styles.addContainer]}
      onPress={onPress}
      testID="add-request-box"
    >
      <Ionicons name="add" size={26} color="rgba(255,255,255,0.6)" />
      <Text style={styles.addTxt}>Permintaan</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#1A1A20",
    position: "relative",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  avatarCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -22,
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  viewerRow: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCyan,
  },
  viewerTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 2,
  },
  bottomRow: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  nameTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 2,
  },
  addContainer: {
    backgroundColor: "#1A1A20",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addTxt: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
  },
});
