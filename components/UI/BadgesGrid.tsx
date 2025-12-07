import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "../useColorScheme";
import Colors from "@/constants/Colors";
import { BadgeResponseDTO } from "@/types/api/badge.type";
import BadgeModal from "./BadgeModal";
import { Ionicons } from "@expo/vector-icons";

interface BadgesGridProps {
  badges: BadgeResponseDTO[];
  loading?: boolean;
  error?: string | null;
  totalBadges?: number;
}

export default function BadgesGrid({
  badges,
  loading = false,
  error = null,
  totalBadges = 0,
}: BadgesGridProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const [selectedBadge, setSelectedBadge] = useState<BadgeResponseDTO | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleBadgePress = (badge: BadgeResponseDTO) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const renderBadgeItem = ({ item }: { item: BadgeResponseDTO }) => (
    <TouchableOpacity
      style={styles.badgeItem}
      onPress={() => handleBadgePress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.badgeIcon, { backgroundColor: colors.borderLight }]}>
        {item.iconUrl ? (
          <Image
            source={{ uri: item.iconUrl }}
            style={styles.badgeImage}
          />
        ) : (
          <Ionicons name="star" size={36} color={colors.primary} />
        )}
      </View>
      <Text
        style={[styles.badgeName, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text
        style={[styles.badgeDescription, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.3,
    },
    badgeCount: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textInverse,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 16,
    },
    gridContainer: {
      paddingVertical: 4,
    },
    badgeItem: {
      flex: 1,
      margin: 6,
      borderRadius: 12,
      backgroundColor: colors.borderLight,
      padding: 14,
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 140,
      borderWidth: 1,
      borderColor: colors.borderLight,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    badgeIcon: {
      width: 56,
      height: 56,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    badgeImage: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
    },
    badgeName: {
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 4,
      lineHeight: 16,
    },
    badgeDescription: {
      fontSize: 10,
      textAlign: "center",
      lineHeight: 14,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    emptySubText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    errorContainer: {
      backgroundColor: colors.error
        ? `${colors.error}20`
        : "rgba(255, 107, 107, 0.2)",
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    errorText: {
      fontSize: 13,
      color: colors.error || "#FF6B6B",
      fontWeight: "500",
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.badgeName, { marginTop: 12 }]}>
          Cargando insignias...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="star-outline" size={52} color={colors.textSecondary} />
        </View>
        <Text style={styles.emptyText}>Sin insignias aún</Text>
        <Text style={styles.emptySubText}>
          Completa retos para ganar insignias y mostrarlas aquí
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={badges}
        renderItem={renderBadgeItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={styles.gridContainer}
        style={styles.gridContainer}
      />

      <BadgeModal
        visible={modalVisible}
        badge={selectedBadge}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
