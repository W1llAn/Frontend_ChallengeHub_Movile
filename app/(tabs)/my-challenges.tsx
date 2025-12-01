import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  View as RNView,
  Platform
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useUserChallenges } from '../../hooks/useUserChallenges';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryIcon } from '@/services/category-icons.service';

export default function MyChallengesScreen() {
  const { challenges, loading, error } = useUserChallenges();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Calcular días restantes
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Abrir modal con detalles
  const openChallengeDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  // Cerrar modal
  const closeChallengeDetails = () => {
    setModalVisible(false);
    setSelectedChallenge(null);
  };

  // Renderizar card al estilo de intereses
  const ChallengeCard = ({ challenge }) => {
    const challengeData = challenge.challenge || challenge;
    const [swipeX] = useState(new Animated.Value(0));
    const [showDelete, setShowDelete] = useState(false);
    const daysRemaining = getDaysRemaining(challengeData.endDate);
    const isActive = challengeData.status === 'ACTIVE';
    const isCompleted = challengeData.status === 'COMPLETED';

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx < 0) {
            swipeX.setValue(Math.max(gestureState.dx, -80));
          } else if (showDelete) {
            swipeX.setValue(Math.min(gestureState.dx - 80, 0));
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx < -40 && !showDelete) {
            handleSwipe("left");
          } else if (gestureState.dx > 40 || (gestureState.dx > -40 && !showDelete)) {
            handleSwipe("right");
          } else if (showDelete && gestureState.dx > -40 && gestureState.dx < 40) {
            handleSwipe("left");
          }
        },
      })
    ).current;

    const handleSwipe = (direction: "left" | "right") => {
      if (direction === "left") {
        Animated.timing(swipeX, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowDelete(true));
      } else {
        Animated.timing(swipeX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowDelete(false));
      }
    };

    const getStatusConfig = () => {
      if (isCompleted) {
        return { label: "Completado", color: "#2196F3", backgroundColor: "#2196F320" };
      }
      if (isActive) {
        return { label: "Activo", color: "#4CAF50", backgroundColor: "#4CAF5020" };
      }
      return { label: "Pendiente", color: "#9E9E9E", backgroundColor: "#9E9E9E20" };
    };

    const statusConfig = getStatusConfig();

    return (
      <View style={styles.categoryWrapper}>
        <Animated.View
          style={[
            styles.categoryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ translateX: swipeX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* TouchableOpacity que cubre toda la card incluyendo la imagen */}
          <TouchableOpacity
            onPress={() => openChallengeDetails(challengeData)}
            activeOpacity={0.7}
            style={styles.fullCardTouchable}
          >
            {/* Imagen rectangular grande */}
            <View style={styles.imageContainer}>
              {challengeData.imageUrl ? (
                <Image
                  source={{ uri: challengeData.imageUrl }}
                  style={styles.challengeImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons
                    name={getCategoryIcon(challengeData.categoryName) as any}
                    size={40}
                    color={colors.primary}
                  />
                  <Text style={[styles.placeholderText, { color: colors.primary }]}>
                    {challengeData.categoryName}
                  </Text>
                </View>
              )}

              {/* Overlay con información rápida - ESTILO MEJORADO */}
              <View style={styles.imageOverlay}>
                <View style={[styles.overlayBadge]}>
                  <Ionicons
                    name={getCategoryIcon(challengeData.categoryName) as any}
                    size={12}
                    color={colors.text}
                  />
                  <Text style={[styles.overlayBadgeText, { color: colors.text }]}>
                    {challengeData.categoryName}
                  </Text>
                </View>

                {isActive && (
                  <View style={[styles.overlayBadge]}>
                    <Text style={[styles.overlayBadgeText, { color: colors.text }]}>
                      {daysRemaining}d
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Contenido de la card */}
            <View style={styles.categoryContent}>
              <RNView style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
                  {challengeData.title}
                </Text>
                <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
                  {formatDate(challengeData.startDate)} - {formatDate(challengeData.endDate)}
                </Text>
              </RNView>

              <RNView style={styles.rightContent}>
                <RNView style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </RNView>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </RNView>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {showDelete && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={() => {
              handleSwipe("right");
              // Aquí puedes agregar la lógica para eliminar el reto
            }}
          >
            <Ionicons name="trash" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Renderizar modal de detalles
  const renderDetailModal = () => {
    if (!selectedChallenge) return null;

    const challenge = selectedChallenge;
    const categoryIcon = getCategoryIcon(challenge.categoryName);
    const daysRemaining = getDaysRemaining(challenge.endDate);
    const isActive = challenge.status === 'ACTIVE';
    const isCompleted = challenge.status === 'COMPLETED';
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeChallengeDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Detalles del Reto
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeChallengeDetails}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Imagen del reto */}
              <View style={styles.modalImageContainer}>
                {challenge.imageUrl ? (
                  <Image
                    source={{ uri: challenge.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.modalImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons
                      name={getCategoryIcon(challenge.categoryName) as any}
                      size={64}
                      color={colors.primary}
                    />
                  </View>
                )}

                {/* Overlay de categoría */}
                <View style={[styles.modalCategoryBadge]}>
                  <Ionicons
                    name={getCategoryIcon(challenge.categoryName) as any}
                    size={14}
                    color={colors.text}
                  />
                  <Text style={[styles.modalCategoryText, { color: colors.text }]}>
                    {challenge.categoryName}
                  </Text>
                </View>
              </View>

              {/* Información principal */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalChallengeTitle, { color: colors.text }]}>
                  {challenge.title}
                </Text>

                <View style={[
                  styles.modalStatusBadge,
                  {
                    backgroundColor: isActive ? '#22c55e15' :
                      isCompleted ? '#3b82f615' :
                        '#6b728015'
                  }
                ]}>
                  <Text style={[
                    styles.modalStatusText,
                    {
                      color: isActive ? '#22c55e' :
                        isCompleted ? '#3b82f6' :
                          colors.textSecondary
                    }
                  ]}>
                    {isActive ? '🟢 Activo' :
                      isCompleted ? '🔵 Completado' :
                        '⚫ Inactivo'}
                  </Text>
                </View>
              </View>

              {/* Descripción */}
              <View style={styles.modalSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Descripción
                </Text>
                <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                  {challenge.description}
                </Text>
              </View>

              {/* Objetivo */}
              {challenge.objective && (
                <View style={styles.modalSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    🎯 Objetivo
                  </Text>
                  <Text style={[styles.modalObjective, { color: colors.textSecondary }]}>
                    {challenge.objective}
                  </Text>
                </View>
              )}

              {/* Información de tiempo */}
              <View style={styles.modalSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  📅 Duración
                </Text>
                <View style={styles.timeInfo}>
                  <View style={styles.timeItem}>
                    <Text style={[styles.timeLabel, { color: colors.textTertiary }]}>
                      Inicio
                    </Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {startDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>

                  <View style={styles.timeItem}>
                    <Text style={[styles.timeLabel, { color: colors.textTertiary }]}>
                      Fin
                    </Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {endDate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>

                  <View style={styles.timeItem}>
                    <Text style={[styles.timeLabel, { color: colors.textTertiary }]}>
                      Duración
                    </Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {durationDays} días
                    </Text>
                  </View>

                  {isActive && (
                    <View style={styles.timeItem}>
                      <Text style={[styles.timeLabel, { color: colors.textTertiary }]}>
                        Días restantes
                      </Text>
                      <Text style={[styles.daysRemainingLarge, { color: colors.primary }]}>
                        {daysRemaining}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Información del creador */}
              <View style={styles.modalSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  👤 Creador
                </Text>
                <View style={styles.creatorInfo}>
                  <View style={[styles.creatorAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.creatorInitials, { color: colors.primary }]}>
                      {challenge.creatorUsername?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.creatorName, { color: colors.text }]}>
                    {challenge.creatorUsername}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Botones de acción */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={closeChallengeDetails}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Cerrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: isCompleted ? colors.textTertiary : colors.primary,
                    opacity: isCompleted ? 0.6 : 1
                  }
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isCompleted ? 'Ver Progreso' : 'Continuar Reto'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    // Estilos para cards con imagen
    categoryWrapper: {
      position: "relative",
      marginBottom: 16,
    },
    categoryCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    fullCardTouchable: {
      flex: 1,
    },
    // Contenedor de imagen rectangular
    imageContainer: {
      height: 140,
      position: 'relative',
    },
    challengeImage: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
    },
    imageOverlay: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: 'transparent',
    },
    // Estilos mejorados para los badges - FONDO BLANCO SEMITRANSPARENTE
    overlayBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    overlayBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    categoryContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    categoryInfo: {
      flex: 1,
      marginRight: 12,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
      lineHeight: 22,
    },
    categorySubtitle: {
      fontSize: 13,
      opacity: 0.7,
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
    },
    deleteButton: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: 80,
      justifyContent: "center",
      alignItems: "center",
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
    },
    // Estilos del modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      height: '90%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeButton: {
      padding: 4,
    },
    modalScroll: {
      flex: 1,
    },
    modalImageContainer: {
      height: 200,
      position: 'relative',
    },
    modalImage: {
      width: '100%',
      height: '100%',
    },
    modalImagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCategoryBadge: {
      position: 'absolute',
      top: 16,
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    modalCategoryText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    modalSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    modalChallengeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      lineHeight: 28,
    },
    modalStatusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    modalStatusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 15,
      lineHeight: 22,
    },
    modalObjective: {
      fontSize: 14,
      lineHeight: 20,
      fontStyle: 'italic',
    },
    timeInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    timeItem: {
      width: '48%',
      marginBottom: 12,
    },
    timeLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    timeValue: {
      fontSize: 14,
      fontWeight: '500',
    },
    daysRemainingLarge: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    creatorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    creatorAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    creatorInitials: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    creatorName: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.error || '#ef4444',
      textAlign: 'center',
      marginBottom: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Cargando tus retos...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar los retos</Text>
        <Text style={[styles.errorText, { fontSize: 14 }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Retos</Text>
        <Text style={styles.subtitle}>
          Toca cualquier reto para ver los detalles completos
        </Text>
      </View>

      {/* Lista de retos con diseño de intereses */}
      <FlatList
        data={challenges}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() :
            item.challenge?.id?.toString() ?? index.toString()
        }
        renderItem={({ item }) => <ChallengeCard challenge={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes retos asignados</Text>
            <Text style={styles.emptySubtext}>
              Explora los retos disponibles y únete a aventuras emocionantes
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      />

      {/* Modal de detalles */}
      {renderDetailModal()}
    </View>
  );
}