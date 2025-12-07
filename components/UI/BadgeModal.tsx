import React from "react";
import {
  StyleSheet,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useColorScheme } from "../useColorScheme";
import Colors from "@/constants/Colors";
import { BadgeResponseDTO } from "@/types/api/badge.type";
import { Ionicons } from "@expo/vector-icons";

interface BadgeModalProps {
  visible: boolean;
  badge: BadgeResponseDTO | null;
  onClose: () => void;
}

export default function BadgeModal({
  visible,
  badge,
  onClose,
}: BadgeModalProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  if (!badge) return null;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingVertical: 24,
      maxHeight: "85%",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.borderLight,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 28,
      marginTop: 8,
    },
    badgeIcon: {
      width: 120,
      height: 120,
      borderRadius: 16,
      marginBottom: 20,
      backgroundColor: colors.borderLight,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeImage: {
      width: "100%",
      height: "100%",
      borderRadius: 16,
    },
    badgeName: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: 10,
      letterSpacing: -0.5,
    },
    badgeDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    infoSection: {
      marginBottom: 24,
    },
    infoLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      lineHeight: 24,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginBottom: 20,
    },
    closeButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.badgeIcon}>
              {badge.iconUrl ? (
                <Image
                  source={{ uri: badge.iconUrl }}
                  style={styles.badgeImage}
                />
              ) : (
                <Ionicons
                  name="star"
                  size={48}
                  color={colors.primary}
                />
              )}
            </View>

            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>
              {badge.description}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>ID de Insignia</Text>
            <Text style={styles.infoValue}>{badge.id}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Fecha de Creación</Text>
            <Text style={styles.infoValue}>
              {formatDate(badge.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
