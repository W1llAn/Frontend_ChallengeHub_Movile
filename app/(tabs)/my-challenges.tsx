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
import { ChallengeCard } from '@/components/UI/ChallengeCard';

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
        renderItem={({ item }) => (
          <ChallengeCard 
            challenge={item} 
            colors={colors} 
            showSwipeToDelete={true}
          />
        )}
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

    
    </View>
  );
}