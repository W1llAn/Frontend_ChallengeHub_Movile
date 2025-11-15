import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@/components/Themed";
import Colors, { Spacing } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

interface LoadingScreenProps {
  message?: string;
  size?: "small" | "large";
}

/**
 * LoadingScreen Component
 * Displays a centered loading indicator with optional message
 * Automatically adapts to the current theme (light/dark)
 *
 * @param message - Optional loading message to display
 * @param size - Size of the loading indicator ('small' | 'large')
 */
export default function LoadingScreen({
  message = "Cargando...",
  size = "large",
}: LoadingScreenProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
});
