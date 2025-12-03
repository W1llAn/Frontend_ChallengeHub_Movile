import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors, { BorderRadius, Shadows, Spacing } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCategories } from "@/hooks/useUserCategories";
import { useUserChallenges } from "@/hooks/useUserChallenges";
import { useCategories } from "@/hooks/useCategories";
import type { Challenge } from "@/types/api/challenge.type";
import type { Category } from "@/types/api/category.type";
import type { UserCategory, CreatorChallengeCount } from "@/types/api/user-category.type";
import { getCategoryIcon } from "@/services/category-icons.service";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.lg * 2;

/**
 * Home Screen - Main feed showing user info, challenges, categories, and top creators
 */
export default function HomeScreen() {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const { completeUser } = useAuth();
  const { 
    categories: userCategories, 
    loading: categoriesLoading, 
    loadUserCategories,
    loadTopCreators 
  } = useUserCategories();
  const { challenges, loading: challengesLoading } = useUserChallenges();
  const { categories: allCategories, loading: allCategoriesLoading, loadAllCategories } = useCategories();
  
  const [refreshing, setRefreshing] = useState(false);
  const [topCreators, setTopCreators] = useState<CreatorChallengeCount[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (completeUser?.id) {
      loadUserCategories(completeUser.id);
    }
    loadAllCategories();
    
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [completeUser?.id]);

  // Cargar top creators de la primera categoría
  useEffect(() => {
    const fetchTopCreators = async () => {
      if (userCategories.length > 0) {
        setLoadingCreators(true);
        try {
          const creators = await loadTopCreators(userCategories[0].categoryId);
          setTopCreators(creators.slice(0, 3)); // Solo top 3
        } catch (error) {
          setTopCreators([]);
        } finally {
          setLoadingCreators(false);
        }
      }
    };
    fetchTopCreators();
  }, [userCategories]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (completeUser?.id) {
        await loadAllCategories();
        await loadUserCategories(completeUser.id);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const activeChallenges = challenges.filter(c => c.status === "active" || c.status === "ACTIVE" || !c.status);
  const completedChallenges = challenges.filter(c => c.status === "completed" || c.status === "COMPLETED");
  const totalProgress = challenges.length > 0 
    ? Math.round(challenges.reduce((acc, c) => acc + (c.progress || 0), 0) / challenges.length)
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: "transparent" }]}>
          <View style={{ backgroundColor: "transparent" }}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.username, { color: colors.text }]}>
              {completeUser?.username || "Usuario"}
            </Text>
          </View>
          
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            {completeUser?.avatarUrl ? (
              <Image
                source={{ uri: completeUser.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <Ionicons name="person" size={28} color={colors.textInverse} />
            )}
          </View>
        </View>

        {/* Enhanced Stats Cards */}
        <View style={[styles.statsContainer, { backgroundColor: "transparent" }]}>
          <EnhancedStatCard
            icon="flame"
            value={activeChallenges.length.toString()}
            label="Activos"
            subtitle="retos en curso"
            colors={colors}
            colorScheme={colorScheme}
            accentColor="#FF6B6B"
          />
          <EnhancedStatCard
            icon="trophy"
            value={completedChallenges.length.toString()}
            label="Completados"
            subtitle="retos finalizados"
            colors={colors}
            colorScheme={colorScheme}
            accentColor="#4ECDC4"
          />
          <EnhancedStatCard
            icon="trending-up"
            value={`${totalProgress}%`}
            label="Progreso"
            subtitle="promedio general"
            colors={colors}
            colorScheme={colorScheme}
            accentColor="#95E1D3"
          />
        </View>

        {/* Active Challenges Section */}
        {challengesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeChallenges.length > 0 ? (
          <View style={{ backgroundColor: "transparent" }}>
            <View style={[styles.sectionHeader, { backgroundColor: "transparent" }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Tus Retos Activos
              </Text>
              <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
                {activeChallenges.length}
              </Text>
            </View>
            <FlatList
              horizontal
              data={activeChallenges}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.challengesList,
                activeChallenges.length === 1 && styles.challengesListCentered,
              ]}
              snapToInterval={activeChallenges.length === 1 ? undefined : CARD_WIDTH * 0.85 + Spacing.sm}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <ChallengeCard 
                  challenge={item} 
                  colors={colors} 
                  colorScheme={colorScheme}
                  isSingle={activeChallenges.length === 1}
                />
              )}
            />
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="rocket-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tienes retos activos
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              ¡Explora las categorías y comienza uno nuevo!
            </Text>
          </View>
        )}

        {/* Top Creators Section */}
        {!loadingCreators && topCreators.length > 0 && (
          <View style={{ backgroundColor: "transparent" }}>
            <View style={[styles.sectionHeader, { backgroundColor: "transparent" }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🏆 Top Creadores
              </Text>
              <Ionicons name="star" size={20} color={colors.secondary} />
            </View>
            <FlatList
              horizontal
              data={topCreators}
              keyExtractor={(item) => item.userId.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.creatorsList}
              renderItem={({ item, index }) => (
                <CreatorCard 
                  creator={item} 
                  rank={index + 1} 
                  colors={colors} 
                  colorScheme={colorScheme} 
                />
              )}
            />
          </View>
        )}

        {/* User Interests Section - Horizontal Scroll */}
        <View style={[styles.sectionHeader, { backgroundColor: "transparent" }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mis Intereses
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
            {userCategories.length}
          </Text>
        </View>
        
        {categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : userCategories.length > 0 ? (
          <FlatList
            horizontal
            data={userCategories}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.interestsList}
            renderItem={({ item }) => (
              <UserCategoryCard
                category={item}
                colors={colors}
                colorScheme={colorScheme}
              />
            )}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="grid-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tienes intereses registrados
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Ve a la pestaña de Intereses para agregar categorías
            </Text>
          </View>
        )}

        {/* All Categories Section - Grid */}
        <View style={[styles.sectionHeader, { backgroundColor: "transparent" }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Todas las Categorías
          </Text>
          <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
            {allCategories.length}
          </Text>
        </View>
        
        {allCategoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={[styles.categoriesGrid, { backgroundColor: "transparent" }]}>
            {allCategories.map((category) => (
              <AllCategoryCard
                key={category.id}
                category={category}
                colors={colors}
                colorScheme={colorScheme}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

// Enhanced Stat Card Component with gradient and better design
interface EnhancedStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  subtitle: string;
  colors: typeof Colors.light;
  colorScheme: "light" | "dark";
  accentColor: string;
}

function EnhancedStatCard({ icon, value, label, subtitle, colors, colorScheme, accentColor }: EnhancedStatCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.enhancedStatCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale: scaleAnim }],
          },
          Shadows.small,
        ]}
      >
        <View
          style={[
            styles.statIconContainerEnhanced,
            { backgroundColor: accentColor + "20" },
          ]}
        >
          <Ionicons name={icon} size={22} color={accentColor} />
        </View>
        <Text style={[styles.statValueEnhanced, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabelEnhanced, { color: colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>
          {subtitle}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: Challenge;
  colors: typeof Colors.light;
  colorScheme: "light" | "dark";
  isSingle?: boolean;
}

function ChallengeCard({ challenge, colors, colorScheme, isSingle = false }: ChallengeCardProps) {
  const progress = challenge.progress || 0;

  return (
    <View
      style={[
        styles.challengeCard,
        isSingle && styles.challengeCardSingle,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Shadows.medium,
      ]}
    >
      <View style={[styles.challengeHeader, { backgroundColor: "transparent" }]}>
        <View
          style={[
            styles.challengeIconContainer,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Ionicons name="flag" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <Text
            style={[styles.challengeTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {challenge.title}
          </Text>
          {challenge.categoryName && (
            <Text style={[styles.challengeCategory, { color: colors.textTertiary }]}>
              {challenge.categoryName}
            </Text>
          )}
        </View>
      </View>

      <Text
        style={[styles.challengeDescription, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {challenge.description}
      </Text>

      {/* Progress Bar */}
      <View style={{ backgroundColor: "transparent" }}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textTertiary }]}>
            Progreso
          </Text>
          <Text style={[styles.progressValue, { color: colors.primary }]}>
            {progress}%
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.primary,
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </View>

      {challenge.endDate && (
        <View style={[styles.challengeFooter, { backgroundColor: "transparent" }]}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.challengeDate, { color: colors.textTertiary }]}>
            Finaliza: {new Date(challenge.endDate).toLocaleDateString()}
          </Text>
        </View>
      )}
    </View>
  );
}

// Creator Card Component
interface CreatorCardProps {
  creator: CreatorChallengeCount;
  rank: number;
  colors: typeof Colors.light;
  colorScheme: "light" | "dark";
}

function CreatorCard({ creator, rank, colors, colorScheme }: CreatorCardProps) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "#FFD700"; // Gold
      case 2: return "#C0C0C0"; // Silver
      case 3: return "#CD7F32"; // Bronze
      default: return colors.primary;
    }
  };

  const medalColor = getMedalColor(rank);

  return (
    <TouchableOpacity
      style={[
        styles.creatorCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Shadows.small,
      ]}
      activeOpacity={0.7}
    >
      <RNView style={[styles.creatorRankBadge, { backgroundColor: medalColor + "20" }]}>
        <Text style={[styles.creatorRankText, { color: medalColor }]}>
          #{rank}
        </Text>
      </RNView>
      <RNView
        style={[
          styles.creatorAvatar,
          {
            backgroundColor: medalColor + "20",
            borderColor: medalColor,
          },
        ]}
      >
        <Text style={[styles.creatorAvatarText, { color: medalColor }]}>
          {creator.username.charAt(0).toUpperCase()}
        </Text>
      </RNView>
      <Text
        style={[styles.creatorUsername, { color: colors.text }]}
        numberOfLines={1}
      >
        {creator.username}
      </Text>
      <Text style={[styles.creatorChallenges, { color: colors.textSecondary }]}>
        {creator.challengeCount} retos
      </Text>
    </TouchableOpacity>
  );
}

// User Category Card Component - Horizontal Scroll
interface UserCategoryCardProps {
  category: UserCategory;
  colors: typeof Colors.light;
  colorScheme: "light" | "dark";
}

function UserCategoryCard({ category, colors, colorScheme }: UserCategoryCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.userCategoryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale: scaleAnim }],
          },
          Shadows.small,
        ]}
      >
        <View
          style={[
            styles.userCategoryIcon,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(category.categoryName) as any}
            size={28}
            color={colors.primary}
          />
        </View>
        <Text
          style={[styles.userCategoryName, { color: colors.text }]}
          numberOfLines={1}
        >
          {category.categoryName}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// All Category Card Component - Grid
interface AllCategoryCardProps {
  category: Category;
  colors: typeof Colors.light;
  colorScheme: "light" | "dark";
}

function AllCategoryCard({ category, colors, colorScheme }: AllCategoryCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.allCategoryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale: scaleAnim }],
          },
          Shadows.small,
        ]}
      >
        <View
          style={[
            styles.allCategoryIcon,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(category.name) as any}
            size={24}
            color={colors.primary}
          />
        </View>
        <Text
          style={[styles.allCategoryName, { color: colors.text }]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
        {category.description && (
          <Text
            style={[styles.allCategoryDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {category.description}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  enhancedStatCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 120,
  },
  statIconContainerEnhanced: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  statValueEnhanced: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: Spacing.xs,
    marginBottom: 2,
  },
  statLabelEnhanced: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: "600",
  },
  challengesList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  challengesListCentered: {
    flexGrow: 1,
    justifyContent: "center",
  },
  challengeCard: {
    width: CARD_WIDTH * 0.85,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  challengeCardSingle: {
    width: CARD_WIDTH * 0.95,
    marginRight: 0,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  challengeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  challengeCategory: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "transparent",
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  challengeFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 4,
  },
  challengeDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  creatorsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  creatorCard: {
    width: 130,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  creatorRankBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  creatorRankText: {
    fontSize: 11,
    fontWeight: "800",
  },
  creatorAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  creatorAvatarText: {
    fontSize: 22,
    fontWeight: "800",
  },
  creatorUsername: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  creatorChallenges: {
    fontSize: 12,
    textAlign: "center",
  },
  interestsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  userCategoryCard: {
    width: 120,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  userCategoryIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  userCategoryName: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  allCategoryCard: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 2) / 2,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 100,
  },
  allCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  allCategoryName: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  allCategoryDescription: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  emptyState: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
