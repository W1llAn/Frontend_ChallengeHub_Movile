/**
 * InfoRow Component
 * Componente reutilizable para mostrar información en filas
 */
import React from "react";
import { StyleSheet, View as RNView, ViewStyle, TextStyle } from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface InfoRowProps {
  label: string;
  value: string | number;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  style,
  labelStyle,
  valueStyle,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
      flex: 1,
    },
    value: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
      textAlign: "right",
      flex: 1,
    },
  });

  return (
    <RNView style={[styles.container, style]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </RNView>
  );
};
