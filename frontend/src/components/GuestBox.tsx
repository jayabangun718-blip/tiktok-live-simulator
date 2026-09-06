import Ionicons from "@react-native-vector-icons/ionicons";
import MDIcon from "@react-native-vector-icons/material-design-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import type { GuestSlot } from "@/src/store/slotsStore";

type Props = {
  guest: GuestSlot;
  onPress: () => void;
  index: number;
};

function formatViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function GuestBox({ guest, onPress }: Props) {
  const initial = (guest.name?.trim()?.[0] ?? "?").toUpperCase();
  const hasAnyPhoto = !!guest.photoUri || !!guest.bgPhotoUri;

  // Empty state: mimic the "+ Permintaan" tile exactly
  if (!hasAnyPhoto) {
    return (
      <Pressable
        style={[styles.container, styles.emptyContainer]}
        onPress={onPress}
        testID={`guest-box-${guest.id}`}
        android_ripple={{ color: "rgba(255,255,255,0.06)" }}
      >
        <Ionicons name="add" size={26} color="rgba(255,255,255,0.6)" />
        <Text style={styles.emptyTxt}>Permintaan</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      testID={`guest-box-${guest.id}`}
      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
    >
      {/* Large background: very light blur so body shape is still visible */}
      {guest.bgPhotoUri && (
        <>
          <Image
            source={{ uri: guest.bgPhotoUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={2.5}
          />
          <View style={styles.dimOverlay} />
        </>
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
        <MDIcon name="diamond-stone" size={16} color={colors.accentCyan} />
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
      style={[styles.container, styles.emptyContainer]}
      onPress={onPress}
      testID="add-request-box"
    >
      <Ionicons name="add" size={26} color="rgba(255,255,255,0.6)" />
      <Text style={styles.emptyTxt}>Permintaan</Text>
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  emptyTxt: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
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
    top: 5,
    left: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCyan,
  },
  viewerTxt: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 3,
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
});
