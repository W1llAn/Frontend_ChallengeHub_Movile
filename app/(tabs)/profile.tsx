import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useBadges } from "@/hooks/useBadges";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useFormValidation, validationRules } from "@/hooks/useFormValidation";
import { showNotifier } from "@/services/notifier";
import { countriesService } from "@/services/countries.service";
import { ImageService } from "@/services/image.service";
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
  Select,
  DatePickerInput,
  BadgesGrid,
} from "@/components/UI";
import type { UserItselfUpdateDTO } from "@/types/api/user.type";
import type { Country } from "@/services/countries.service";

export default function ProfileScreen() {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const { logout, authError, user } = useAuth();
  const {
    currentUser,
    loading,
    updating,
    updateCurrentUser,
    fetchCurrentUser,
    refreshCurrentUser,
    error: userError,
  } = useUsers();

  const { userBadges, loading: badgesLoading, error: badgesError, refreshBadges } = useBadges(
    currentUser?.id || null
  );

  const { userPoints, totalPoints, refreshPoints } = useUserPoints(currentUser?.id || null);

  // Estado local de edición
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<UserItselfUpdateDTO | null>(null);
  const [formData, setFormData] = useState<UserItselfUpdateDTO>({
    username: "",
    email: "",
    description: "",
    location: "",
    birthDate: "",
    profileStatus: "public",
    avatarUrl: undefined,
  });
  const { errors, validateForm, setFieldError, getFieldError, clearErrors } = useFormValidation();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Estado para manejo de avatar
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Cargar países cuando entra a edición
  useEffect(() => {
    if (isEditing && countries.length === 0) {
      loadCountries();
    }
  }, [isEditing, countries.length]);

  // Inicializar formulario cuando se carga el usuario (sin clearErrors en dependencias)
  useEffect(() => {
    if (currentUser && !isEditing && !hasInitialized) {
      const initialData: UserItselfUpdateDTO = {
        username: currentUser.username || "",
        email: currentUser.email || "",
        description: currentUser.description || "",
        location: currentUser.location || "",
        birthDate: currentUser.birthDate || "",
        profileStatus:
          currentUser.profileStatus === "PRIVATE" ? "private" : "public",
        avatarUrl: currentUser.avatarUrl || undefined,
      };
      setFormData(initialData);
      setHasInitialized(true);
    }
  }, [currentUser, isEditing, hasInitialized]);

  // Resetear hasInitialized cuando entra a edición
  useEffect(() => {
    if (!isEditing) {
      setHasInitialized(false);
    }
  }, [isEditing]);

  // Cuando se cargan los países y el usuario tiene ubicación guardada, seleccionarla automáticamente
  useEffect(() => {
    if (
      isEditing &&
      countries.length > 0 &&
      currentUser?.location &&
      !loadingCountries
    ) {
      // Intentar encontrar el país en la lista
      const countryExists = countries.some(
        (country) => country.name === currentUser.location
      );

      // Si el país existe en la lista, se mantiene en formData
      // Si no existe, el usuario tendrá que seleccionar uno
      if (!countryExists && formData.location === currentUser.location) {
        console.log(
          "El país del usuario no se encontró en la lista:",
          currentUser.location
        );
      }
    }
  }, [isEditing, countries.length, currentUser?.location, loadingCountries, formData.location]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const data = await countriesService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error("Error cargando países:", error);
      showNotifier("Error al cargar lista de países", "warn");
    } finally {
      setLoadingCountries(false);
    }
  };

  // Manejar cambio en inputs
  const handleInputChange = (
    field: keyof UserItselfUpdateDTO,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    setFieldError(field, null);
  };

  // Manejar cambio de avatar
  const handleAvatarChange = async () => {
    try {
      // Solicitar permisos de la galería
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showNotifier("Se necesitan permisos para acceder a la galería", "warn");
        return;
      }

      // Abrir selector de imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];
        setSelectedImageUri(selectedAsset.uri);
        setAvatarError(null);
        
        // Subir imagen al servidor
        setUploadingAvatar(true);
        
        try {
          // Convertir URI a File para React Native
          const file = {
            uri: selectedAsset.uri,
            type: selectedAsset.type === "image" ? "image/jpeg" : selectedAsset.mimeType || "image/jpeg",
            name: selectedAsset.fileName || `avatar_${Date.now()}.jpg`,
            size: selectedAsset.fileSize || 0,
          };
          
          const uploadResponse = await ImageService.upload(file as any);
          
          if (uploadResponse.imageUrl) {
            // Actualizar formData con la nueva URL del avatar
            setFormData((prev) => ({
              ...prev,
              avatarUrl: uploadResponse.imageUrl,
            }));
            showNotifier("Avatar actualizado correctamente", "success");
          } else {
            throw new Error("No se recibió URL del archivo");
          }
        } catch (uploadError) {
          console.error("Error subiendo avatar:", uploadError);
          const errorMsg = uploadError instanceof Error ? uploadError.message : "Error al subir el avatar";
          setAvatarError(errorMsg);
          showNotifier(errorMsg, "error");
          setSelectedImageUri(null);
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Error seleccionando imagen:", error);
      showNotifier("Error al seleccionar imagen", "error");
    }
  };

  // Guardar cambios
  const handleSaveProfile = async () => {
    // Definir reglas de validación (username no se valida porque está bloqueado)
    const rules = {
      email: [
        validationRules.required("El correo es requerido"),
        validationRules.email(),
      ],
      description: [
        validationRules.required("La descripción es requerida"),
        validationRules.minLength(
          10,
          "La descripción debe tener al menos 10 caracteres"
        ),
        validationRules.maxLength(
          500,
          "La descripción no puede exceder 500 caracteres"
        ),
      ],
      location: [
        validationRules.required("La ubicación es requerida"),
      ],
      birthDate: [
        validationRules.required("La fecha de nacimiento es requerida"),
        validationRules.date("Formato de fecha inválido"),
        validationRules.birthDate(),
        validationRules.notFutureDate(),
      ],
    };

    // Validar formulario
    if (!validateForm(formData, rules)) {
      showNotifier("Por favor, revisa los errores del formulario", "warn");
      return;
    }

    // Guardar datos originales para resetear si es necesario
    if (!originalFormData && currentUser) {
      setOriginalFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        description: currentUser.description || "",
        location: currentUser.location || "",
        birthDate: currentUser.birthDate || "",
        profileStatus:
          currentUser.profileStatus === "PRIVATE" ? "private" : "public",
        avatarUrl: currentUser.avatarUrl || undefined,
      });
    }

    const success = await updateCurrentUser(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = useCallback(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        description: currentUser.description || "",
        location: currentUser.location || "",
        birthDate: currentUser.birthDate || "",
        profileStatus:
          currentUser.profileStatus === "PRIVATE" ? "private" : "public",
        avatarUrl: currentUser.avatarUrl || undefined,
      });
    }
    clearErrors();
    setIsEditing(false);
  }, [currentUser, clearErrors]);

  // Resetear formulario a datos originales
  const handleResetForm = useCallback(() => {
    Alert.alert(
      "Resetear formulario",
      "¿Deseas descartar los cambios y volver a los datos originales?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          onPress: () => {
            if (currentUser) {
              setFormData({
                username: currentUser.username || "",
                email: currentUser.email || "",
                description: currentUser.description || "",
                location: currentUser.location || "",
                birthDate: currentUser.birthDate || "",
                profileStatus:
                  currentUser.profileStatus === "PRIVATE"
                    ? "private"
                    : "public",
                avatarUrl: currentUser.avatarUrl || undefined,
              });
              clearErrors();
              showNotifier("Formulario reseteado", "success");
            }
          },
          style: "destructive",
        },
      ]
    );
  }, [currentUser, clearErrors]);

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

  // Cargar datos del usuario cuando se entra a la pantalla - CORREGIDO
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUserData = async () => {
        try {
          // Si ya tenemos currentUser, no necesitamos recargar a menos que esté refrescando
          if (currentUser?.id && !refreshing) {
            return;
          }

          // Si tenemos el usuario del contexto auth, usamos ese ID
          if (user?.id && isActive && !currentUser) {
            await fetchCurrentUser(user.id);
          }
          // O si ya tenemos currentUser pero queremos refrescar
          else if (currentUser?.id && isActive && refreshing) {
            await refreshCurrentUser();
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };

      loadUserData();

      return () => {
        isActive = false;
      };
    }, [
      user?.id,
      currentUser,
      refreshing,
      fetchCurrentUser,
      refreshCurrentUser,
    ])
  );

  // Refrescar datos
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshCurrentUser(),
        refreshPoints(),
        refreshBadges(),
      ]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCurrentUser, refreshPoints, refreshBadges]);

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
      marginBottom: 28,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    avatarContainer: {
      marginBottom: 16,
      position: "relative",
    },
    avatarLoadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 100,
      justifyContent: "center",
      alignItems: "center",
    },
    userInfo: {
      alignItems: "center",
      marginBottom: 12,
    },
    username: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 16,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    statItem: {
      alignItems: "center",
      gap: 6,
      flex: 1,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    section: {
      marginBottom: 24,
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
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Avatar
                source={selectedImageUri || currentUser.avatarUrl}
                initials={currentUser.username?.substring(0, 2).toUpperCase()}
                size="large"
              />
              {uploadingAvatar && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            </View>

            {/* Botón de cambio de avatar en modo edición */}
            {isEditing && (
              <View style={{ marginTop: 12, marginBottom: 8 }}>
                <Button
                  label={uploadingAvatar ? "Subiendo..." : "Cambiar Avatar"}
                  onPress={handleAvatarChange}
                  variant="outline"
                  disabled={uploadingAvatar}
                  fullWidth={false}
                />
                {avatarError && (
                  <Text style={{ color: colors.error, fontSize: 12, marginTop: 8, textAlign: "center" }}>
                    {avatarError}
                  </Text>
                )}
              </View>
            )}

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{currentUser.username}</Text>
              <Text style={styles.email}>{currentUser.email}</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalPoints}</Text>
                <Text style={styles.statLabel}>Puntos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userBadges?.totalBadges || 0}
                </Text>
                <Text style={styles.statLabel}>Insignias</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentUser.profileStatus === "public" ? "Público" : "Privado"}
                </Text>
                <Text style={styles.statLabel}>Perfil</Text>
              </View>
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
                {currentUser.username && (
                  <InfoRow label="Usuario" value={currentUser.username} />
                )}
                {currentUser.email && (
                  <InfoRow label="Email" value={currentUser.email} />
                )}
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
              <>
                <Card style={styles.infoCard}>
                  <Input
                    label="Nombre de Usuario (No editable)"
                    placeholder="Tu nombre de usuario"
                    value={formData.username}
                    onChangeText={(value) =>
                      handleInputChange("username", value)
                    }
                    error={getFieldError("username")}
                    editable={false}
                  />
                </Card>

                <Card style={styles.infoCard}>
                  <Input
                    label="Correo Electrónico"
                    placeholder="Tu correo"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange("email", value)}
                    keyboardType="email-address"
                    error={getFieldError("email")}
                  />
                </Card>

                <Card style={styles.infoCard}>
                  <Input
                    label="Descripción"
                    placeholder="Cuéntanos sobre ti... (10-500 caracteres)"
                    value={formData.description}
                    onChangeText={(value) =>
                      handleInputChange("description", value)
                    }
                    multiline
                    numberOfLines={4}
                    error={getFieldError("description")}
                  />
                  {formData.description && (
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          formData.description.length > 500
                            ? Colors[colorScheme].error
                            : Colors[colorScheme].textTertiary,
                        marginTop: 4,
                      }}
                    >
                      {formData.description.length}/500
                    </Text>
                  )}
                </Card>

                <Card style={styles.infoCard}>
                  {loadingCountries ? (
                    <LoadingSpinner message="Cargando países..." />
                  ) : (
                    <Select
                      label="Ubicación (País)"
                      placeholder="Seleccionar país"
                      value={formData.location}
                      onValueChange={(value) =>
                        handleInputChange("location", value)
                      }
                      options={countries.map((country) => ({
                        label: country.name,
                        value: country.name,
                      }))}
                      error={getFieldError("location")}
                    />
                  )}
                </Card>

                <Card style={styles.infoCard}>
                  <DatePickerInput
                    label="Fecha de Nacimiento"
                    placeholder="Seleccionar fecha"
                    value={formData.birthDate}
                    onDateChange={(value) =>
                      handleInputChange("birthDate", value)
                    }
                    error={getFieldError("birthDate")}
                  />
                </Card>

                <Card style={styles.infoCard}>
                  <Select
                    label="Estado de Perfil"
                    placeholder="Seleccionar estado"
                    value={formData.profileStatus}
                    onValueChange={(value) =>
                      handleInputChange("profileStatus", value)
                    }
                    options={[
                      { label: "Público", value: "public" },
                      { label: "Privado", value: "private" },
                    ]}
                  />
                </Card>

                {/* Botones adicionales */}
                <View style={styles.buttonRow}>
                  <View style={styles.buttonFlex}>
                    <Button
                      label="Resetear"
                      onPress={handleResetForm}
                      variant="outline"
                      fullWidth
                      disabled={updating}
                    />
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Points Breakdown Section */}
          {!isEditing && (
            <View style={styles.section}>
              <SectionHeader title="Desglose de Puntos" />
              {userPoints && userPoints.pointsByChallenge && userPoints.pointsByChallenge.length > 0 ? (
                <Card>
                  {userPoints.pointsByChallenge.map((challenge, index) => (
                    <View key={challenge.challengeId}>
                      <View style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, flex: 1, marginRight: 12 }}>
                            {challenge.challengeTitle}
                          </Text>
                          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>
                            {challenge.totalPoints} pts
                          </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                          {challenge.approvedSubmissionsCount} envío{challenge.approvedSubmissionsCount !== 1 ? 's' : ''} aprobado{challenge.approvedSubmissionsCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      {index < userPoints.pointsByChallenge.length - 1 && (
                        <View style={{ height: 1, backgroundColor: colors.borderLight, marginVertical: 8 }} />
                      )}
                    </View>
                  ))}
                </Card>
              ) : (
                <Card>
                  <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      No tienes puntos aún
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          )}

          {/* Badges Section */}
          {!isEditing && (
            <View style={styles.section}>
              <SectionHeader title="Tus Insignias" />
              {userBadges && userBadges.badges.length > 0 ? (
                <BadgesGrid
                  badges={userBadges.badges}
                  loading={badgesLoading}
                  error={badgesError}
                  totalBadges={userBadges.totalBadges}
                />
              ) : (
                <Card>
                  <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                      No tienes insignias aún
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: "center" }}>
                      Completa retos y consigue insignias
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

