import React from "react";
import { View, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

interface TopAppBarProps {
  title: string;
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
  showNotifications?: boolean;
  showLogout?: boolean;
}

export default function TopAppBar({
  title,
  onNotificationPress,
  onLogoutPress,
  showNotifications = true,
  showLogout = true,
}: TopAppBarProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "¿Estás seguro de que deseas cerrar sesión?"
      );

      if (confirmed) {
        if (onLogoutPress) {
          onLogoutPress();
        }
      }
    } else {
      // En mobile usar Alert nativo
      Alert.alert(
        "Cerrar Sesión",
        "¿Estás seguro de que deseas cerrar sesión?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Cerrar Sesión",
            style: "destructive",
            onPress: () => {
              if (onLogoutPress) {
                onLogoutPress();
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Left section - Title */}
      <View style={styles.leftSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Center section - Empty */}
      <View style={styles.centerSection} />

      {/* Right section - Notifications & Logout */}
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
        {showLogout && (
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="log-out-outline" size={26} color={colors.error} />
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
