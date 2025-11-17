/**
 * Avatar Component
 * Componente reutilizable para mostrar avatares
 */
import React from "react";
import {
  StyleSheet,
  Image,
  View as RNView,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface AvatarProps {
  source?: string | null;
  initials?: string;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials = "U",
  size = "medium",
  style,
  onPress,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const sizeConfig: Record<
    string,
    { width: number; height: number; fontSize: number }
  > = {
    small: { width: 40, height: 40, fontSize: 12 },
    medium: { width: 80, height: 80, fontSize: 20 },
    large: { width: 120, height: 120, fontSize: 32 },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const styles = StyleSheet.create({
    avatar: {
      width: config.width,
      height: config.height,
      borderRadius: config.width / 2,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.primaryLight,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    initials: {
      fontSize: config.fontSize,
      fontWeight: "bold",
      color: colors.textInverse,
    },
  });

  const Container = onPress ? TouchableOpacity : RNView;

  return (
    <Container style={[styles.avatar, style]} onPress={onPress}>
      {source ? (
        <Image source={{ uri: source }} style={styles.image} />
      ) : (
        <Text style={styles.initials}>{initials.substring(0, 2)}</Text>
      )}
    </Container>
  );
};
