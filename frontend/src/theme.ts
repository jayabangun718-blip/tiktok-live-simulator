// Dark-only theme tokens for the live streaming UI clone.
// Colors are picked to match the reference screenshot (near-black background,
// warm host box, cyan accents, red hearts, bright pill chips).

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const dark = {
  // Surfaces
  surface: "#08080B",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#141419",
  onSurfaceSecondary: "#E5E7EB",
  surfaceTertiary: "#1E1E24",
  onSurfaceTertiary: "#D1D5DB",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#08080B",
  muted: "#8A8A93",

  // Brand
  brand: "#FF3B6B",
  onBrand: "#FFFFFF",
  brandPrimary: "#FF3B6B",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#2B2B33",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#1A1A1F",
  onBrandTertiary: "#FFFFFF",

  // Accent colors used across the UI
  accentCyan: "#22D3EE",
  accentPink: "#FF4D8D",
  accentYellow: "#F59E0B",
  accentGreen: "#22C55E",
  accentPurple: "#A855F7",
  hostOrange: "#E9884A",
  hostOrangeLight: "#F0A874",

  // Status
  success: "#22C55E",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  onWarning: "#111111",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#3B82F6",
  onInfo: "#FFFFFF",

  // Lines
  border: "#26262E",
  borderStrong: "#3A3A44",
  divider: "#1F1F26",
};

export type ThemeColors = typeof dark;

export const defaultScheme = "dark" satisfies ColorScheme;

export const themes: { light?: ThemeColors; dark: ThemeColors } = { dark };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme);
}

setColorScheme?.(defaultScheme);

export const colors: ThemeColors = dark;

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system === "light" && themes.light ? "light" : "dark";
  return { scheme, colors: themes[scheme] ?? themes.dark };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
