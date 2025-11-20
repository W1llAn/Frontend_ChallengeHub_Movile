import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { showNotifier } from "@/services/notifier";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import {
  Card,
  Button,
  Input,
  Avatar,
  SectionHeader,
  LoadingSpinner,
  InfoRow,
  Badge,
} from "@/components/UI";
import type { UserItselfUpdateDTO } from "@/types/api/user.type";

export default function ProfileScreen() {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  // Auth y User hooks - Solo necesitamos el logout y el error
  const { logout, authError } = useAuth();
  const {
    currentUser,
    loading,
    updating,
    updateCurrentUser,
    fetchCurrentUser,
    refreshCurrentUser,
    error: userError,
  } = useUsers();

  // Estado local de edición
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<UserItselfUpdateDTO>({
    description: "",
    location: "",
    birthDate: "",
    profileStatus: "",
    avatarUrl: undefined,
  });

  // Inicializar formulario cuando se carga el usuario
  useEffect(() => {
    if (currentUser && !isEditing) {
      setFormData({
        description: currentUser.description || "",
        location: currentUser.location || "",
        birthDate: currentUser.birthDate || "",
        profileStatus: currentUser.profileStatus || "",
        avatarUrl: currentUser.avatarUrl || undefined,
      });
    }
  }, [currentUser, isEditing]);

  // Manejar cambio en inputs
  const handleInputChange = (
    field: keyof UserItselfUpdateDTO,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Guardar cambios
  const handleSaveProfile = async () => {
    if (!formData.description.trim()) {
      showNotifier("La descripción es requerida", "warn");
      return;
    }

    const success = await updateCurrentUser(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    if (currentUser) {
      setFormData({
        description: currentUser.description || "",
        location: currentUser.location || "",
        birthDate: currentUser.birthDate || "",
        profileStatus: currentUser.profileStatus || "",
        avatarUrl: currentUser.avatarUrl || undefined,
      });
    }
    setIsEditing(false);
  };

  // Cerrar sesión
  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", onPress: () => {}, style: "cancel" },
      {
        text: "Cerrar sesión",
        onPress: () => {
          logout();
        },
        style: "destructive",
      },
    ]);
  };

  // Cargar datos del usuario cuando se entra a la pantalla
  useFocusEffect(
    useCallback(() => {
      if (currentUser?.id) {
        fetchCurrentUser(currentUser.id);
      }
    }, [currentUser?.id, fetchCurrentUser])
  );

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCurrentUser();
    setRefreshing(false);
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    container: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarContainer: {
      marginBottom: 12,
    },
    userInfo: {
      alignItems: "center",
      marginBottom: 8,
    },
    username: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    pointsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    points: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    statusBadge: {
      marginTop: 12,
    },
    section: {
      marginBottom: 20,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    buttonFlex: {
      flex: 1,
    },
    infoCard: {
      marginBottom: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginVertical: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.error || "#FF6B6B",
      marginBottom: 16,
      textAlign: "center",
    },
    retryButton: {
      marginTop: 16,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Cargando perfil..." />
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar error si existe
  if (authError || userError) {
    const errorMessage = authError || userError;
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <View style={styles.retryButton}>
            <Button
              label="Reintentar"
              onPress={handleRefresh}
              variant="primary"
              fullWidth
            />
          </View>
          <View style={[styles.retryButton, { marginTop: 12 }]}>
            <Button
              label="Cerrar Sesión"
              onPress={handleLogout}
              variant="danger"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Esperando datos del usuario..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.container}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                source={currentUser.avatarUrl}
                initials={currentUser.username?.substring(0, 2).toUpperCase()}
                size="large"
              />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{currentUser.username}</Text>
              <Text style={styles.email}>{currentUser.email}</Text>
            </View>

            {/* Points */}
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>⭐ {currentUser.points} Puntos</Text>
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadge}>
              <Badge
                label={currentUser.profileStatus || "Activo"}
                variant={
                  currentUser.profileStatus === "ACTIVE" ? "success" : "warning"
                }
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Edit/Save Buttons */}
          <View style={styles.buttonRow}>
            {!isEditing ? (
              <>
                <View style={styles.buttonFlex}>
                  <Button
                    label="Editar Perfil"
                    onPress={() => setIsEditing(true)}
                    variant="primary"
                    fullWidth
                  />
                </View>
                <View style={styles.buttonFlex}>
                  <Button
                    label="Cerrar Sesión"
                    onPress={handleLogout}
                    variant="danger"
                    fullWidth
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.buttonFlex}>
                  <Button
                    label="Guardar"
                    onPress={handleSaveProfile}
                    variant="primary"
                    fullWidth
                    loading={updating}
                  />
                </View>
                <View style={styles.buttonFlex}>
                  <Button
                    label="Cancelar"
                    onPress={handleCancelEdit}
                    variant="outline"
                    fullWidth
                    disabled={updating}
                  />
                </View>
              </>
            )}
          </View>

          {/* Profile Information */}
          <View style={styles.section}>
            <SectionHeader title="Información Personal" />

            {!isEditing ? (
              // View Mode
              <Card>
                {currentUser.description && (
                  <InfoRow
                    label="Descripción"
                    value={currentUser.description}
                  />
                )}
                {currentUser.location && (
                  <InfoRow label="Ubicación" value={currentUser.location} />
                )}
                {currentUser.birthDate && (
                  <InfoRow
                    label="Fecha de Nacimiento"
                    value={currentUser.birthDate}
                  />
                )}
                {currentUser.role && (
                  <InfoRow label="Rol" value={currentUser.role} />
                )}
                <InfoRow
                  label="Miembro desde"
                  value={
                    currentUser.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString(
                          "es-ES"
                        )
                      : "N/A"
                  }
                />
              </Card>
            ) : (
              // Edit Mode
              <Card style={styles.infoCard}>
                <Input
                  label="Descripción"
                  placeholder="Cuéntanos sobre ti..."
                  value={formData.description}
                  onChangeText={(value) =>
                    handleInputChange("description", value)
                  }
                  multiline
                  numberOfLines={4}
                />
              </Card>
            )}

            {isEditing && (
              <>
                <Card style={styles.infoCard}>
                  <Input
                    label="Ubicación"
                    placeholder="Tu ciudad o país"
                    value={formData.location}
                    onChangeText={(value) =>
                      handleInputChange("location", value)
                    }
                  />
                </Card>

                <Card style={styles.infoCard}>
                  <Input
                    label="Fecha de Nacimiento"
                    placeholder="YYYY-MM-DD"
                    value={formData.birthDate}
                    onChangeText={(value) =>
                      handleInputChange("birthDate", value)
                    }
                  />
                </Card>

                <Card style={styles.infoCard}>
                  <Input
                    label="Estado de Perfil"
                    placeholder="ACTIVE, INACTIVE, etc."
                    value={formData.profileStatus}
                    onChangeText={(value) =>
                      handleInputChange("profileStatus", value)
                    }
                  />
                </Card>
              </>
            )}
          </View>

          {/* Statistics Section */}
          {!isEditing && (
            <View style={styles.section}>
              <SectionHeader title="Estadísticas" />
              <Card>
                <InfoRow label="Puntos Totales" value={currentUser.points} />
                <InfoRow
                  label="Estado"
                  value={currentUser.profileStatus || "N/A"}
                />
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
