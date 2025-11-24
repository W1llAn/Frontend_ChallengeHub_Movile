import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

interface TopAppBarProps {
  title: string;
  onNotificationPress?: () => void;
  showNotifications?: boolean;
}

export default function TopAppBar({
  title,
  onNotificationPress,
  showNotifications = true,
}: TopAppBarProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Left section - Title */}
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Center section - Empty */}
      <View style={styles.centerSection} />

      {/* Right section - Notifications */}
      <View style={styles.rightSection}>
        {showNotifications && (
          <Pressable
            onPress={onNotificationPress}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <FontAwesome name="bell-o" size={24} color={colors.text} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: -0.015,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
