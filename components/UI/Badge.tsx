/**
 * Badge Component
 * Componente reutilizable para insignias/etiquetas
 */
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { View } from "../Themed";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "small" | "medium";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  size = "medium",
  style,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const variantColors: Record<string, { bg: string; text: string }> = {
    primary: { bg: colors.primary, text: colors.textInverse },
    secondary: { bg: colors.secondary, text: colors.text },
    success: { bg: colors.success, text: colors.textInverse },
    warning: { bg: colors.warning, text: colors.text },
    error: { bg: colors.error, text: colors.textInverse },
  };

  const sizeConfig: Record<string, { padding: number; fontSize: number }> = {
    small: { padding: 4, fontSize: 11 },
    medium: { padding: 6, fontSize: 12 },
  };

  const currentVariant = variantColors[variant] || variantColors.primary;
  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const styles = StyleSheet.create({
    badge: {
      backgroundColor: currentVariant.bg,
      borderRadius: 12,
      paddingHorizontal: currentSize.padding * 2,
      paddingVertical: currentSize.padding,
      alignSelf: "flex-start",
    },
    text: {
      color: currentVariant.text,
      fontSize: currentSize.fontSize,
      fontWeight: "600",
    },
  });

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};
