/**
 * SectionHeader Component
 * Componente reutilizable para encabezados de secciones
 */
import React from "react";
import { StyleSheet, TextStyle } from "react-native";
import { Text, View } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: object;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  style,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      paddingHorizontal: 0,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: subtitle ? 4 : 0,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};
