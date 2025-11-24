/**
 * LoadingSpinner Component
 * Componente reutilizable para mostrar estado de carga
 */
import React from "react";
import { StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { View } from "../Themed";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = "large",
  style,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    message: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};
