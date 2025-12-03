import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors, { BorderRadius, Shadows, Spacing } from "@/constants/Colors";
import { useCategories } from "@/hooks/useCategories";
import { useChallenges } from "@/hooks/useChallenges";
import type { Category } from "@/types/api/category.type";
import type { Challenge } from "@/types/api/challenge.type";
import { getCategoryIcon } from "@/services/category-icons.service";

const { width } = Dimensions.get("window");

type SortOption = "recent" | "oldest";

/**
 * Category Search Bar Component - Memoized to prevent unnecessary re-renders
 */
const CategorySearchBar = memo(({ 
  searchQuery, 
  onSearchChange, 
  colors 
}: { 
  searchQuery: string; 
  onSearchChange: (text: string) => void; 
  colors: typeof Colors.light;
}) => {
  return (
    <View
      style={[
        styles.searchContainer,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Buscar categorías..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange("")}>
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

CategorySearchBar.displayName = "CategorySearchBar";

/**
 * Category Card Component for horizontal list
 */
interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
}

const CategoryCard = memo(({ category, isSelected, onPress, colors }: CategoryCardProps) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View
        style={[
          styles.categoryCard,
          {
            backgroundColor: isSelected ? colors.primary : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            transform: [{ scale: scaleAnim }],
          },
          Shadows.small,
        ]}
      >
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: isSelected ? colors.background : colors.primary + "15" },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(category.name) as any}
            size={24}
            color={isSelected ? colors.primary : colors.primary}
          />
        </View>
        <Text
          style={[
            styles.categoryName,
            { color: isSelected ? colors.textInverse : colors.text },
          ]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

CategoryCard.displayName = "CategoryCard";

/**
 * Sort Control Component
 */
interface SortControlProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  colors: typeof Colors.light;
}

const SortControl = memo(({ sortBy, onSortChange, colors }: SortControlProps) => {
  return (
    <View style={[styles.sortContainer, { backgroundColor: "transparent" }]}>
      <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>
        Ordenar por:
      </Text>
      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "recent" && styles.sortButtonActive,
            {
              backgroundColor: sortBy === "recent" ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onSortChange("recent")}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === "recent" ? colors.textInverse : colors.text },
            ]}
          >
            Más Recientes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "oldest" && styles.sortButtonActive,
            {
              backgroundColor: sortBy === "oldest" ? colors.primary : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onSortChange("oldest")}
        >
          <Text
            style={[
              styles.sortButtonText,
              { color: sortBy === "oldest" ? colors.textInverse : colors.text },
            ]}
          >
            Más Antiguos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

SortControl.displayName = "SortControl";

/**
 * Challenge Card Component
 */
interface ChallengeCardProps {
  challenge: Challenge;
  colors: typeof Colors.light;
}

const ChallengeCard = memo(({ challenge, colors }: ChallengeCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#4CAF50";
      case "COMPLETED":
        return "#2196F3";
      case "CANCELLED":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const statusColor = getStatusColor(challenge.status);

  return (
    <View
      style={[
        styles.challengeCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Shadows.small,
      ]}
    >
      <View style={[styles.challengeHeader, { backgroundColor: "transparent" }]}>
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <Text style={[styles.challengeTitle, { color: colors.text }]} numberOfLines={2}>
            {challenge.title}
          </Text>
          <View style={[styles.challengeMeta, { backgroundColor: "transparent" }]}>
            <Ionicons name="folder-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.challengeMetaText, { color: colors.textTertiary }]}>
              {challenge.categoryName}
            </Text>
          </View>
        </View>
        <RNView style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {challenge.status}
          </Text>
        </RNView>
      </View>

      <Text
        style={[styles.challengeDescription, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {challenge.description}
      </Text>

      {challenge.objective && (
        <View style={[styles.objectiveContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="flag-outline" size={14} color={colors.primary} />
          <Text
            style={[styles.objectiveText, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {challenge.objective}
          </Text>
        </View>
      )}

      <View style={[styles.challengeFooter, { backgroundColor: "transparent" }]}>
        <View style={[styles.challengeFooterItem, { backgroundColor: "transparent" }]}>
          <Ionicons name="person-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.challengeFooterText, { color: colors.textTertiary }]}>
            {challenge.creatorUsername}
          </Text>
        </View>
        <View style={[styles.challengeFooterItem, { backgroundColor: "transparent" }]}>
          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.challengeFooterText, { color: colors.textTertiary }]}>
            {new Date(challenge.startDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
});

ChallengeCard.displayName = "ChallengeCard";

/**
 * Explore Screen - Main Component
 */
export default function ExploreScreen() {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const { categories, loading: categoriesLoading, loadAllCategories } = useCategories();
  const {
    challenges,
    pagedResponse,
    loading: challengesLoading,
    loadChallengesByCategory,
    loadMoreChallenges,
    resetChallenges,
  } = useChallenges();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Load categories on mount
  useEffect(() => {
    loadAllCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [categories, searchQuery]);

  // Sort challenges
  const sortedChallenges = useMemo(() => {
    const sorted = [...challenges];
    sorted.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [challenges, sortBy]);

  // Handle category selection
  const handleCategorySelect = useCallback(
    async (category: Category) => {
      setSelectedCategory(category);
      setCurrentPage(0);
      resetChallenges();
      await loadChallengesByCategory(category.id, 0, 10);
    },
    [loadChallengesByCategory, resetChallenges]
  );

  // Handle load more challenges
  const handleLoadMore = useCallback(() => {
    if (
      !challengesLoading &&
      pagedResponse &&
      !pagedResponse.last &&
      selectedCategory
    ) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMoreChallenges(selectedCategory.id, nextPage, 10);
    }
  }, [
    challengesLoading,
    pagedResponse,
    selectedCategory,
    currentPage,
    loadMoreChallenges,
  ]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllCategories();
    if (selectedCategory) {
      setCurrentPage(0);
      resetChallenges();
      await loadChallengesByCategory(selectedCategory.id, 0, 10);
    }
    setRefreshing(false);
  }, [loadAllCategories, selectedCategory, loadChallengesByCategory, resetChallenges]);

  // Render challenge list footer
  const renderFooter = () => {
    if (!challengesLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "transparent" }]}>
        <Text style={[styles.title, { color: colors.text }]}>Explorar Retos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Descubre retos por categoría
        </Text>
      </View>

      {/* Category Search */}
      <CategorySearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        colors={colors}
      />

      {/* Categories Horizontal List */}
      <View style={{ backgroundColor: "transparent" }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorías</Text>
        {categoriesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            horizontal
            data={filteredCategories}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                isSelected={selectedCategory?.id === item.id}
                onPress={() => handleCategorySelect(item)}
                colors={colors}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No se encontraron categorías
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Challenges Section */}
      {selectedCategory && (
        <>
          {/* Sort Control */}
          <SortControl sortBy={sortBy} onSortChange={setSortBy} colors={colors} />

          {/* Challenges List */}
          <FlatList
            data={sortedChallenges}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.challengesList}
            renderItem={({ item }) => <ChallengeCard challenge={item} colors={colors} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              !challengesLoading ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No hay retos en esta categoría
                  </Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </>
      )}

      {/* Empty State - No Category Selected */}
      {!selectedCategory && !categoriesLoading && (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="compass-outline" size={80} color={colors.textTertiary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Selecciona una categoría
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Elige una categoría para ver los retos disponibles
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryCard: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    minWidth: 100,
    marginRight: Spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  sortContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  sortButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  sortButtonActive: {
    borderWidth: 0,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  challengesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  challengeCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 4,
  },
  challengeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  challengeMetaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  objectiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  objectiveText: {
    fontSize: 12,
    flex: 1,
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  challengeFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  challengeFooterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  loadingFooter: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
