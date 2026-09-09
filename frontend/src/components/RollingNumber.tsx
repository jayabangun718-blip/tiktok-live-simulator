import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View, type TextStyle } from "react-native";

type Props = {
  value: string;
  textStyle?: TextStyle | TextStyle[];
  height?: number;
};

// Odometer-style roll: new value slides in from bottom to center,
// previous value slides from center up and out.
export function RollingNumber({ value, textStyle, height = 18 }: Props) {
  const [display, setDisplay] = useState(value);
  const [prev, setPrev] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setDisplay((cur) => {
      if (value === cur) return cur;
      setPrev(cur);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start(() => setPrev(null));
      return value;
    });
  }, [value, anim]);

  const incomingTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });
  const incomingOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const outgoingTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height],
  });
  const outgoingOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={{ height, overflow: "hidden", justifyContent: "center" }}>
      {prev !== null && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              transform: [{ translateY: outgoingTranslate }],
              opacity: outgoingOpacity,
            },
          ]}
        >
          <Text style={textStyle}>{prev}</Text>
        </Animated.View>
      )}
      <Animated.View
        style={{
          transform: [{ translateY: incomingTranslate }],
          opacity: incomingOpacity,
        }}
      >
        <Text style={textStyle}>{display}</Text>
      </Animated.View>
    </View>
  );
}
