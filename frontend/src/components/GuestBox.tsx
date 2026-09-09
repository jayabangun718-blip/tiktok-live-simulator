import Ionicons from "@react-native-vector-icons/ionicons";
import MDIcon from "@react-native-vector-icons/material-design-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import type { GuestSlot } from "@/src/store/slotsStore";
import { RollingNumber } from "./RollingNumber";

type Props = {
  guest: GuestSlot;
  onPress: () => void;
  index: number;
};

function formatViewers(n: number): string {
  if (n >= 1000) {
    const v = n / 1000;
    const s = v % 1 === 0 ? String(v) : v.toFixed(1);
    return `${s}K`;
  }
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
            source={guest.bgPhotoUri}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={2.5}
            transition={0}
            cachePolicy="memory-disk"
          />
          <View style={styles.dimOverlay} />
        </>
      )}

      {/* Small circular avatar in the center */}
      <View style={styles.avatarCircle}>
        {guest.photoUri ? (
          <Image
            source={guest.photoUri}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        ) : (
          <Text style={styles.avatarInitial}>{initial}</Text>
        )}
      </View>

      {/* Viewer count top-left */}
      <View style={styles.viewerRow}>
        <View style={styles.viewerIcon}>
          <MDIcon name="star-david" size={10} color="#FFFFFF" />
        </View>
        <RollingNumber value={formatViewers(guest.viewers)} textStyle={styles.viewerTxt} />
      </View>

      {/* Bottom bar: name + plus */}
      <View style={styles.bottomRow}>
        <Text style={styles.nameTxt} numberOfLines={1}>
          {guest.name}
        </Text>
        <MDIcon name="plus-thick" size={13} color="rgba(255,255,255,0.95)" />
      </View>

      {/* Mute icon bottom-right corner */}
      {guest.muted && (
        <View style={styles.muteBadge}>
          <Ionicons name="mic-off" size={12} color="rgba(255,255,255,0.9)" />
        </View>
      )}
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
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  viewerIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentCyan,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCyan,
  },
  viewerTxt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  bottomRow: {
    position: "absolute",
    left: 4,
    bottom: 4,
    maxWidth: "92%",
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  nameTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  muteBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
  },
});
