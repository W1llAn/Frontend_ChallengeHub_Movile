import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationsContext } from "@/contexts/NotificationsContext";

interface TopAppBarProps {
  title: string;
  showNotifications?: boolean;
}

export default function TopAppBar({
  title,
  showNotifications = true,
}: TopAppBarProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { user, completeUser } = useAuth();
  const { unreadCount } = useNotificationsContext();

  console.log('[TopAppBar] 🔔 Rendered with:', { 
    userId: completeUser?.id, 
    unreadCount, 
    showNotifications 
  });

  const handleNotificationPress = () => {
    console.log('[TopAppBar] 🔔 Notification bell pressed');
    router.push('/notifications');
  };

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
            onPress={handleNotificationPress}
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <FontAwesome name="bell-o" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
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
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 16,
  },
});
