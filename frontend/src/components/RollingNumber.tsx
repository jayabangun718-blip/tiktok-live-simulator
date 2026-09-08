import { useEffect, useState } from "react";
import { StyleSheet, type TextStyle, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DURATION = 320;

// When `text` changes, the NEW value slides up from the bottom into the centre
// while the PREVIOUS value slides from the centre up and out the top. The value
// jumps straight to the new total (no digit-by-digit counting) — matching the
// reference video.
export function RollingNumber({
  text,
  textStyle,
  height,
}: {
  text: string;
  textStyle: TextStyle;
  height: number;
}) {
  const [curr, setCurr] = useState(text);
  const [prev, setPrev] = useState(text);
  const progress = useSharedValue(1); // 1 = settled (curr centred)

  useEffect(() => {
    if (text !== curr) {
      setPrev(curr);
      setCurr(text);
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // New: from +height (below centre) -> 0 (centre), fading in.
  const newStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height * (1 - progress.value) }],
    opacity: progress.value,
  }));

  // Old: from 0 (centre) -> -height (above centre), fading out.
  const oldStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -height * progress.value }],
    opacity: 1 - progress.value,
  }));

  return (
    <View style={[styles.clip, { height }]}>
      {/* In-flow current value defines the width/height of the container */}
      <Animated.Text
        style={[textStyle, { height, lineHeight: height }, newStyle]}
        testID="viewer-count"
        numberOfLines={1}
      >
        {curr}
      </Animated.Text>
      {prev !== curr ? (
        <Animated.Text
          style={[
            textStyle,
            styles.abs,
            { height, lineHeight: height },
            oldStyle,
          ]}
          numberOfLines={1}
        >
          {prev}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    justifyContent: "center",
  },
  abs: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
