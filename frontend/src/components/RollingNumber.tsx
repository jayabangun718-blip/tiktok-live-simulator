import { useEffect } from "react";
import { StyleSheet, type TextStyle, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DURATION = 650;

// A single digit column that slides vertically (odometer/slot-reel style) to
// reveal its target digit whenever `digit` changes.
function RollingDigit({
  digit,
  height,
  textStyle,
}: {
  digit: number;
  height: number;
  textStyle: TextStyle;
}) {
  const y = useSharedValue(-digit * height);

  useEffect(() => {
    y.value = withTiming(-digit * height, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [digit, height, y]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <View style={{ height, overflow: "hidden" }}>
      <Animated.View style={animStyle}>
        {DIGITS.map((d) => (
          <Animated.Text
            key={d}
            style={[
              textStyle,
              { height, lineHeight: height, textAlign: "center" },
            ]}
          >
            {d}
          </Animated.Text>
        ))}
      </Animated.View>
    </View>
  );
}

// Renders a formatted number string; every 0-9 character rolls, other
// characters (".", "k", ",") stay static so the whole value animates like the
// reference video.
export function RollingNumber({
  text,
  textStyle,
  digitHeight,
}: {
  text: string;
  textStyle: TextStyle;
  digitHeight: number;
}) {
  return (
    <View style={styles.row}>
      {text.split("").map((ch, idx) => {
        if (ch >= "0" && ch <= "9") {
          return (
            <RollingDigit
              // Index-based key keeps a stable column per position.
              key={`d-${idx}`}
              digit={Number(ch)}
              height={digitHeight}
              textStyle={textStyle}
            />
          );
        }
        return (
          <Animated.Text
            key={`s-${idx}`}
            style={[textStyle, { height: digitHeight, lineHeight: digitHeight }]}
          >
            {ch}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
