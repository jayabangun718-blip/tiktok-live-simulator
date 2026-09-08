// Responsive scaling so the live-room layout looks PROPORTIONALLY IDENTICAL
// on every device. Every fixed px value (font size, avatar size, position,
// padding, gap, icon size) is multiplied by the ratio of the device width to a
// fixed reference width. Portrait is locked, so width never changes at runtime.
import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 390; // iPhone reference width used when the UI was designed
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Clamp so ultra-wide tablets don't blow the grid up beyond ~1.6x.
const factor = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.6);

export function s(size: number): number {
  return PixelRatio.roundToNearestPixel(size * factor);
}
