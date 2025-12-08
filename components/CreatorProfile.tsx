import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import type { UserResponseDTO } from "@/types/api/user.type";
import { transformAvatarUrl } from "@/utils/image-url.util";
import { Image } from "react-native";

interface CreatorProfileProps {
  visible: boolean;
  creator: UserResponseDTO | null;
  onClose: () => void;
}

export const CreatorProfile: React.FC<CreatorProfileProps> = ({
  visible,
  creator,
  onClose,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!creator) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrador":
        return "#eb8482ff";
      case "user":
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {creator.profileStatus.toLowerCase() === 'private' ? (
        <RNView style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            style={[
              styles.privateProfileContainer,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>

            {/* Avatar */}
            <RNView style={styles.privateAvatarContainer}>
              <RNView
                style={[
                  styles.privateAvatar,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {(() => {
                  const transformedUrl = transformAvatarUrl(creator.avatarUrl);
                  return transformedUrl ? (
                    <Image
                      source={{ uri: transformedUrl }}
                      style={styles.privateAvatar}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                      {creator.username.charAt(0).toUpperCase()}
                    </Text>
                  );
                })()}
              </RNView>
            </RNView>

            {/* Username and role */}
            <Text style={[styles.privateUsername, { color: colors.text }]}>
              @{creator.username}
            </Text>
            <RNView
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleBadgeColor(creator.role) + "30" },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: getRoleBadgeColor(creator.role) },
                ]}
              >
                {creator.role}
              </Text>
            </RNView>

            {/* Lock icon and message */}
            <RNView style={styles.privateMessageContainer}>
              <RNView
                style={[
                  styles.lockIconContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={48}
                  color={colors.textSecondary}
                />
              </RNView>

              <Text style={[styles.privateTitle, { color: colors.text }]}>
                Perfil Privado
              </Text>
              <Text
                style={[styles.privateDescription, { color: colors.textSecondary }]}
              >
                Este usuario ha configurado su perfil como privado. La información detallada no está disponible públicamente.
              </Text>

              {/* Info badge */}
              <RNView
                style={[
                  styles.privateInfoBadge,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[styles.privateInfoText, { color: colors.textSecondary }]}
                >
                  Solo se muestra información básica
                </Text>
              </RNView>
            </RNView>
          </Animated.View>
        </RNView>
      ) : (
      <RNView style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header con gradiente */}
          <RNView
            style={[
              styles.header,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Avatar */}
            <RNView style={styles.avatarContainer}>
              <RNView
                style={[
                  styles.avatar,
                  {
                    backgroundColor: colors.background,
                    borderColor: "#fff",
                  },
                ]}
              >
                {(() => {
                  const transformedUrl = transformAvatarUrl(creator.avatarUrl);
                  return transformedUrl ? (
                    <Image
                      source={{ uri: transformedUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                      {creator.username.charAt(0).toUpperCase()}
                    </Text>
                  );
                })()}
              </RNView>
            </RNView>

            {/* Username y rol */}
            <Text style={styles.username}>@{creator.username}</Text>
            <RNView
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleBadgeColor(creator.role) + "30" },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: getRoleBadgeColor(creator.role) },
                ]}
              >
                {creator.role}
              </Text>
            </RNView>
          </RNView>

          {/* Contenido scrollable */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Stats */}
            <RNView style={styles.statsContainer}>
              <RNView
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {creator.points || 0}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Puntos
                </Text>
              </RNView>

              <RNView
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="calendar" size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {creator.createdAt ? new Date(creator.createdAt).getFullYear() : "N/A"}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Miembro desde
                </Text>
              </RNView>

              <RNView
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={
                    creator.profileStatus === "public"
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={24}
                  color={
                    creator.profileStatus === "public" ? "#4CAF50" : "#9E9E9E"
                  }
                />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {creator.profileStatus === 'public' ? 'Publico' : 'Privado'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Estado
                </Text>
              </RNView>
            </RNView>

            {/* Información detallada */}
            <RNView
              style={[
                styles.infoSection,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Descripción - siempre mostrar */}
              <RNView style={styles.infoItem}>
                <RNView style={styles.infoHeader}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.infoTitle, { color: colors.text }]}>
                    Descripción
                  </Text>
                </RNView>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {creator.description || "Sin descripción"}
                </Text>
              </RNView>

              {/* Ubicación - siempre mostrar */}
              <RNView style={styles.infoItem}>
                <RNView style={styles.infoHeader}>
                  <Ionicons
                    name="location"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.infoTitle, { color: colors.text }]}>
                    Ubicación
                  </Text>
                </RNView>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {creator.location || "No especificada"}
                </Text>
              </RNView>

              {/* Email - siempre mostrar */}
              <RNView style={styles.infoItem}>
                <RNView style={styles.infoHeader}>
                  <Ionicons name="mail" size={20} color={colors.primary} />
                  <Text style={[styles.infoTitle, { color: colors.text }]}>
                    Email
                  </Text>
                </RNView>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {creator.email || "No disponible"}
                </Text>
              </RNView>

              {/* Fecha de nacimiento - siempre mostrar */}
              <RNView style={styles.infoItem}>
                <RNView style={styles.infoHeader}>
                  <Ionicons name="gift" size={20} color={colors.primary} />
                  <Text style={[styles.infoTitle, { color: colors.text }]}>
                    Fecha de nacimiento
                  </Text>
                </RNView>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {creator.birthDate ? formatDate(creator.birthDate) : "No especificada"}
                </Text>
              </RNView>
            </RNView>
          </ScrollView>
        </Animated.View>
      </RNView>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  infoSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  infoItem: {
    gap: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28,
  },
  // Estilos para perfil privado
  privateProfileContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  privateAvatarContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  privateAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  privateUsername: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  privateMessageContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  lockIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  privateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  privateDescription: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  privateInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  privateInfoText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
