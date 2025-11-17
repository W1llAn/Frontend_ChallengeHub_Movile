/**
 * Card Component
 * Componente reutilizable para contenedores con estilos consistentes
 */
import React from "react";
import { StyleSheet, ViewStyle, Platform } from "react-native";
import { View } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  marginBottom?: number;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  marginBottom = 12,
  onPress,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: padding,
      paddingVertical: padding,
      marginBottom,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        web: {
          shadowColor: "rgba(0,0,0,0.1)",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        },
        ios: {
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
  });

  return (
    <View style={[styles.card, style]} onTouchEnd={onPress}>
      {children}
    </View>
  );
};
