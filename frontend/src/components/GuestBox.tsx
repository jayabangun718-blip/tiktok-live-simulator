import Ionicons from "@react-native-vector-icons/ionicons";
import MDIcon from "@react-native-vector-icons/material-design-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import { s } from "@/src/utils/scale";
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
        <Ionicons name="add" size={s(26)} color="rgba(255,255,255,0.6)" />
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
          <MDIcon name="star-david" size={s(6)} color="#FFFFFF" />
        </View>
        <Text style={styles.viewerTxt}>{formatViewers(guest.viewers)}</Text>
      </View>

      {/* Bottom bar: name + mute icon */}
      <View style={styles.bottomRow}>
        <Text style={styles.nameTxt} numberOfLines={1}>
          {guest.name}
        </Text>
        {guest.muted && (
          <Ionicons name="volume-mute" size={s(11)} color="rgba(255,255,255,0.7)" />
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
      <Ionicons name="add" size={s(26)} color="rgba(255,255,255,0.6)" />
      <Text style={styles.emptyTxt}>Permintaan</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: s(4),
    overflow: "hidden",
    backgroundColor: "#1A1A20",
    position: "relative",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: s(2),
  },
  emptyTxt: {
    color: "rgba(255,255,255,0.7)",
    fontSize: s(11),
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
    marginLeft: s(-22),
    marginTop: s(-22),
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: s(20),
    fontWeight: "700",
  },
  viewerRow: {
    position: "absolute",
    top: s(5),
    left: s(5),
    flexDirection: "row",
    alignItems: "center",
    gap: s(3),
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: s(5),
    paddingVertical: s(2),
    borderRadius: s(12),
  },
  viewerIcon: {
    width: s(10),
    height: s(10),
    borderRadius: s(5),
    backgroundColor: colors.accentCyan,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: colors.accentCyan,
  },
  viewerTxt: {
    color: "#fff",
    fontSize: s(11),
    fontWeight: "800",
  },
  bottomRow: {
    position: "absolute",
    left: s(4),
    bottom: s(4),
    maxWidth: "92%",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: s(2),
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: s(4),
    paddingVertical: s(1.5),
    borderRadius: s(7),
  },
  nameTxt: {
    color: "#fff",
    fontSize: s(7),
    fontWeight: "700",
    flexShrink: 1,
  },
});
