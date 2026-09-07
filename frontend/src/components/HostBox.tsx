import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
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
        <Image source={{ uri: host.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
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
        <Ionicons name="person" size={10} color="#fff" />
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
        <Ionicons name="navigate" size={22} color="#fff" style={{ transform: [{ rotate: "-90deg" }] }} />
      </View>

      {/* Name bottom */}
      <View style={styles.nameRow}>
        <View style={styles.nameAvatar}>
          <Image
            source={require("../../assets/images/lion.png")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
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
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.hostOrange,
    position: "relative",
  },
  placeholderCircle: {
    position: "absolute",
    top: "40%",
    left: "50%",
    width: 96,
    height: 96,
    borderRadius: 48,
    marginLeft: -48,
    marginTop: -48,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  placeholderInitial: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
  },
  hostTag: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hostTagTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  bubble: {
    position: "absolute",
    top: 44,
    left: 40,
    backgroundColor: colors.accentCyan,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    maxWidth: "72%",
  },
  bubbleTxt: {
    color: "#0A2530",
    fontSize: 12,
    fontWeight: "700",
  },
  bubbleTail: {
    position: "absolute",
    left: -6,
    top: 8,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: colors.accentCyan,
  },
  cursor: {
    position: "absolute",
    top: 40,
    left: 20,
    transform: [{ rotate: "-20deg" }],
    opacity: 0.95,
  },
  nameRow: {
    position: "absolute",
    left: 6,
    bottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    maxWidth: "80%",
  },
  nameAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  nameDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentGreen,
  },
  nameTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 110,
  },
});
