import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useFormValidation, validationRules } from "@/hooks/useFormValidation";
import { showNotifier } from "@/services/notifier";
import { countriesService } from "@/services/countries.service";
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

  // Guardar cambios
  const handleSaveProfile = async () => {
    // Definir reglas de validación
    const rules = {
      username: [
        validationRules.required("El nombre de usuario es requerido"),
        validationRules.username(),
      ],
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

  // Refrescar datos - CORREGIDO
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCurrentUser();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCurrentUser]);

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
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
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
                    label="Nombre de Usuario"
                    placeholder="Tu nombre de usuario"
                    value={formData.username}
                    onChangeText={(value) =>
                      handleInputChange("username", value)
                    }
                    error={getFieldError("username")}
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
