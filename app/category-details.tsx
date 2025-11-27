import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { getChallengesByUserCategory } from "@/services/user-category.service";
import type { UserCategoryChallenge } from "@/types/api/user-category.type";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { showNotifier } from "@/services/notifier";
import { Badge } from "@/components/UI/Badge";

// Componente para mostrar una tarjeta de reto
const ChallengeCard: React.FC<{
  challenge: UserCategoryChallenge;
  colors: any;
}> = ({ challenge, colors }) => {
  const getStatusConfig = (status: string, progressPercent: number) => {
    if (progressPercent === 100 || status === "COMPLETED") {
      return {
        label: "Completado",
        color: "#4CAF50",
        backgroundColor: "#4CAF5020",
      };
    }
    if (status === "ACTIVE") {
      return {
        label: "Activo",
        color: "#4CAF50",
        backgroundColor: "#4CAF5020",
      };
    }
    return {
      label: "Pendiente",
      color: "#9E9E9E",
      backgroundColor: "#9E9E9E20",
    };
  };

  const statusConfig = getStatusConfig(
    challenge.status,
    challenge.progressPercent
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View
      style={[
        styles.challengeCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header del reto */}
      <View style={styles.challengeHeader}>
        <View style={styles.challengeTitleContainer}>
          <Text style={[styles.challengeTitle, { color: colors.text }]}>
            {challenge.title}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      <Text
        style={[styles.challengeDescription, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {challenge.description}
      </Text>

      {/* Objetivo */}
      <View style={styles.objectiveContainer}>
        <Ionicons name="flag-outline" size={16} color={colors.primary} />
        <Text
          style={[styles.objectiveText, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {challenge.objective}
        </Text>
      </View>

      {/* Fechas */}
      <View style={styles.datesContainer}>
        <View style={styles.dateItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(challenge.startDate)}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
        <View style={styles.dateItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(challenge.endDate)}
          </Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Progreso
          </Text>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>
            {challenge.progressPercent}%
          </Text>
        </View>
        <View
          style={[styles.progressBarBackground, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${challenge.progressPercent}%`,
                backgroundColor:
                  challenge.progressPercent === 100
                    ? "#4CAF50"
                    : colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default function CategoryDetailsScreen() {
  const { user, completeUser } = useAuth();
  const params = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const [challenges, setChallenges] = useState<UserCategoryChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categoryId = params.categoryId ? parseInt(params.categoryId) : null;
  const categoryName = params.categoryName || "Categoría";

  console.log('\n🔍 [CATEGORY-DETAILS] Componente inicializado');
  console.log('📋 [CATEGORY-DETAILS] Params:', JSON.stringify(params, null, 2));
  console.log('🆔 [CATEGORY-DETAILS] User ID desde user:', user?.id);
  console.log('🆔 [CATEGORY-DETAILS] User ID desde completeUser:', completeUser?.id);
  console.log('🆔 [CATEGORY-DETAILS] Category ID:', categoryId);
  console.log('🆔 [CATEGORY-DETAILS] Category Name:', categoryName);

  const loadChallenges = useCallback(async () => {
    console.log('\n🔍 [CATEGORY-DETAILS] Iniciando loadChallenges...');
    console.log('❓ [CATEGORY-DETAILS] Verificando: completeUser.id =', completeUser?.id, ', categoryId =', categoryId);
    
    const userId = completeUser?.id;
    
    if (!userId || !categoryId) {
      console.warn('⚠️ [CATEGORY-DETAILS] Falta completeUser.id o categoryId, abortando');
      setLoading(false);
      return;
    }

    try {
      console.log('🌐 [CATEGORY-DETAILS] Llamando a getChallengesByUserCategory');
      const data = await getChallengesByUserCategory({
        userId: userId,
        categoryId: categoryId,
      });
      console.log('✅ [CATEGORY-DETAILS] Datos recibidos:', JSON.stringify(data, null, 2));
      console.log('📊 [CATEGORY-DETAILS] Número de desafíos:', data?.length || 0);
      setChallenges(data);
    } catch (error: any) {
      console.error('❌ [CATEGORY-DETAILS] Error loading challenges:', error);
      console.error('❌ [CATEGORY-DETAILS] Error completo:', JSON.stringify(error, null, 2));
      console.error('❌ [CATEGORY-DETAILS] Response:', error?.response?.data);
      showNotifier(
        error?.response?.data?.message || "Error al cargar desafíos",
        "error"
      );
    } finally {
      console.log('🏁 [CATEGORY-DETAILS] Finalizando loadChallenges');
      setLoading(false);
      setRefreshing(false);
    }
  }, [completeUser?.id, categoryId]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  // Estadísticas
  const activeChallenges = challenges.filter(
    (c) => c.status === "ACTIVE"
  ).length;
  const completedChallenges = challenges.filter(
    (c) => c.progressPercent === 100 || c.status === "COMPLETED"
  ).length;
  const averageProgress =
    challenges.length > 0
      ? Math.round(
          challenges.reduce((acc, c) => acc + c.progressPercent, 0) /
            challenges.length
        )
      : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {categoryName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {challenges.length}{" "}
            {challenges.length === 1 ? "desafío" : "desafíos"}
          </Text>
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="flash" size={20} color="#4CAF50" />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {activeChallenges}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Activo
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {completedChallenges}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Completado
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="trending-up" size={20} color="#FF9800" />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {averageProgress}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Progreso
          </Text>
        </View>
      </View>

      {/* Lista de retos */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {refreshing ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 20 }}
          />
        ) : challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="file-tray-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No hay desafíos en esta categoría
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Explora y únete a nuevos desafíos
            </Text>
          </View>
        ) : (
          <>
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.challengeId}
                challenge={challenge}
                colors={colors}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Botón de actualizar */}
      {challenges.length > 0 && (
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  challengeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
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
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  challengeTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  objectiveContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  objectiveText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  datesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  refreshButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
