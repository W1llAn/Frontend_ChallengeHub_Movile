/**
 * Button Component
 * Componente reutilizable para botones
 */
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "medium",
  style,
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const sizeStyles: Record<string, { padding: number; fontSize: number }> = {
    small: { padding: 8, fontSize: 12 },
    medium: { padding: 12, fontSize: 14 },
    large: { padding: 16, fontSize: 16 },
  };

  const variantStyles: Record<
    string,
    { backgroundColor: string; textColor: string }
  > = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.textInverse,
    },
    secondary: {
      backgroundColor: colors.secondary,
      textColor: colors.text,
    },
    outline: {
      backgroundColor: "transparent",
      textColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.error,
      textColor: colors.textInverse,
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const styles = StyleSheet.create({
    button: {
      backgroundColor: disabled
        ? colors.textTertiary
        : currentVariant.backgroundColor,
      borderRadius: 8,
      paddingVertical: currentSize.padding,
      paddingHorizontal: currentSize.padding * 2,
      alignItems: "center",
      justifyContent: "center",
      width: fullWidth ? "100%" : "auto",
      borderWidth: variant === "outline" ? 2 : 0,
      borderColor: variant === "outline" ? colors.primary : "transparent",
    },
    text: {
      color: disabled ? colors.textInverse : currentVariant.textColor,
      fontSize: currentSize.fontSize,
      fontWeight: "600",
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={currentVariant.textColor} />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
