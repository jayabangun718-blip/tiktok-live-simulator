import { StyleSheet, type TextStyle, View } from "react-native";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";

const DURATION = 350;

// When `text` changes, the old value slides OUT to the left while the new
// value slides IN from the right — the horizontal slide transition from the
// reference video. The value is shown as a full integer by the caller.
export function RollingNumber({
  text,
  textStyle,
  height,
}: {
  text: string;
  textStyle: TextStyle;
  height: number;
}) {
  return (
    <View style={[styles.clip, { height }]}>
      <Animated.Text
        key={text}
        entering={SlideInRight.duration(DURATION)}
        exiting={SlideOutLeft.duration(DURATION)}
        style={[textStyle, { height, lineHeight: height }]}
        testID="viewer-count"
        numberOfLines={1}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    justifyContent: "center",
  },
});
