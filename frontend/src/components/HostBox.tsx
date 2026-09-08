import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import { s } from "@/src/utils/scale";
import type { HostSlot } from "@/src/store/slotsStore";

type Props = {
  host: HostSlot;
  onPress: () => void;
};

export function HostBox({ host, onPress }: Props) {
  const initial = (host.name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      testID="host-box"
      android_ripple={{ color: "rgba(255,255,255,0.08)" }}
    >
      {host.photoUri ? (
        <Image source={host.photoUri} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} cachePolicy="memory-disk" />
      ) : (
        <LinearGradient
          colors={[colors.hostOrangeLight, colors.hostOrange, "#B85C2A"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        >
          <View style={styles.placeholderCircle}>
            <Text style={styles.placeholderInitial}>{initial}</Text>
          </View>
        </LinearGradient>
      )}

      {/* Host tag */}
      <View style={styles.hostTag} testID="host-tag">
        <Ionicons name="person" size={s(10)} color="#fff" />
        <Text style={styles.hostTagTxt}>Host</Text>
      </View>

      {/* Speech bubble */}
      {host.message ? (
        <View style={styles.bubble} testID="host-bubble">
          <Text style={styles.bubbleTxt} numberOfLines={1}>
            {host.message}
          </Text>
          <View style={styles.bubbleTail} />
        </View>
      ) : null}

      {/* Cursor overlay decoration */}
      <View style={styles.cursor}>
        <Ionicons name="navigate" size={s(22)} color="#fff" style={{ transform: [{ rotate: "-90deg" }] }} />
      </View>

      {/* Name bottom */}
      <View style={styles.nameRow}>
        <View style={styles.nameAvatar}>
          <Image
            source={require("../../assets/images/lion.png")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={0}
          />
        </View>
        <Text style={styles.nameTxt} numberOfLines={1}>
          {host.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: s(6),
    overflow: "hidden",
    backgroundColor: colors.hostOrange,
    position: "relative",
  },
  placeholderCircle: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: s(96),
    height: s(96),
    borderRadius: s(48),
    marginLeft: s(-48),
    marginTop: s(-48),
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  placeholderInitial: {
    color: "#fff",
    fontSize: s(48),
    fontWeight: "800",
  },
  hostTag: {
    position: "absolute",
    top: s(6),
    left: s(6),
    flexDirection: "row",
    alignItems: "center",
    gap: s(3),
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: s(7),
    paddingVertical: s(3),
    borderRadius: s(10),
  },
  hostTagTxt: {
    color: "#fff",
    fontSize: s(10),
    fontWeight: "700",
  },
  bubble: {
    position: "absolute",
    top: s(44),
    left: s(40),
    backgroundColor: colors.accentCyan,
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(6),
    maxWidth: "72%",
  },
  bubbleTxt: {
    color: "#0A2530",
    fontSize: s(12),
    fontWeight: "700",
  },
  bubbleTail: {
    position: "absolute",
    left: s(-6),
    top: s(8),
    width: 0,
    height: 0,
    borderTopWidth: s(6),
    borderBottomWidth: s(6),
    borderRightWidth: s(8),
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: colors.accentCyan,
  },
  cursor: {
    position: "absolute",
    top: s(40),
    left: s(20),
    transform: [{ rotate: "-20deg" }],
    opacity: 0.95,
  },
  nameRow: {
    position: "absolute",
    left: s(6),
    bottom: s(6),
    flexDirection: "row",
    alignItems: "center",
    gap: s(5),
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: s(6),
    paddingVertical: s(3),
    borderRadius: s(12),
    maxWidth: "80%",
  },
  nameAvatar: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  nameDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: colors.accentGreen,
  },
  nameTxt: {
    color: "#fff",
    fontSize: s(11),
    fontWeight: "600",
    maxWidth: s(110),
  },
});
