import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  View as RNView,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCategories } from "@/hooks/useUserCategories";
import { useUsers } from "@/hooks/useUsers";
import type { UserCategory, CreatorChallengeCount } from "@/types/api/user-category.type";
import type { UserResponseDTO } from "@/types/api/user.type";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { getCategoryIcon } from "@/services/category-icons.service";
import { Ionicons } from "@expo/vector-icons";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { CreatorProfile } from "@/components/CreatorProfile";

// Componente para la tarjeta de categoría en el scroll horizontal
const CategoryCard: React.FC<{
  category: UserCategory;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
}> = ({ category, isSelected, onPress, colors }) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.categoryCardIcon,
          {
            backgroundColor: isSelected
              ? colors.background + "40"
              : colors.primary + "20",
          },
        ]}
      >
        <Ionicons
          name={getCategoryIcon(category.categoryName) as any}
          size={24}
          color={isSelected ? "#fff" : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.categoryCardText,
          { color: isSelected ? "#fff" : colors.text },
        ]}
        numberOfLines={1}
      >
        {category.categoryName}
      </Text>
    </TouchableOpacity>
  );
};

// Componente para el podio (top 3)
const PodiumDisplay: React.FC<{
  creators: CreatorChallengeCount[];
  colors: any;
  onCreatorPress: (username: string) => void;
}> = React.memo(({ creators, colors, onCreatorPress }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [creators]);

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return colors.primary;
    }
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1:
        return 140;
      case 2:
        return 110;
      case 3:
        return 110;
      default:
        return 100;
    }
  };

  // Ordenar para mostrar: 2do, 1ro, 3ro
  const podiumOrder = [
    creators[1], // 2nd place (left)
    creators[0], // 1st place (center)
    creators[2], // 3rd place (right)
  ].filter(Boolean);

  const positions = [2, 1, 3];

  return (
    <Animated.View style={[styles.podiumContainer, { opacity: fadeAnim }]}>
      <Text style={[styles.podiumTitle, { color: colors.text }]}>
        🏆 Top 3 Creadores
      </Text>
      <RNView style={styles.podiumRow}>
        {podiumOrder.map((creator, index) => {
          const position = positions[index];
          const height = getPodiumHeight(position);
          const color = getPodiumColor(position);

          return (
            <TouchableOpacity
              key={creator.userId}
              style={styles.podiumItem}
              onPress={() => onCreatorPress(creator.username)}
              activeOpacity={0.7}
            >
              <RNView style={styles.podiumCreatorInfo}>
                <RNView
                  style={[
                    styles.podiumAvatar,
                    {
                      backgroundColor: color + "30",
                      borderColor: color,
                    },
                  ]}
                >
                  <Text style={[styles.podiumAvatarText, { color }]}>
                    {creator.username.charAt(0).toUpperCase()}
                  </Text>
                </RNView>
                <Text
                  style={[styles.podiumUsername, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {creator.username}
                </Text>
                <Text
                  style={[styles.podiumChallenges, { color: colors.textSecondary }]}
                >
                  {creator.challengeCount} retos
                </Text>
              </RNView>
              <RNView
                style={[
                  styles.podiumBase,
                  {
                    height,
                    backgroundColor: color + "20",
                    borderTopColor: color,
                  },
                ]}
              >
                <Text style={[styles.podiumPosition, { color }]}>
                  {position}
                </Text>
              </RNView>
            </TouchableOpacity>
          );
        })}
      </RNView>
    </Animated.View>
  );
});

// Componente para la lista de creadores (4+)
const CreatorListItem: React.FC<{
  creator: CreatorChallengeCount;
  rank: number;
  colors: any;
  onPress: () => void;
}> = React.memo(({ creator, rank, colors, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.creatorListItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <RNView
        style={[
          styles.rankBadge,
          { backgroundColor: colors.primary + "20" },
        ]}
      >
        <Text style={[styles.rankText, { color: colors.primary }]}>
          #{rank}
        </Text>
      </RNView>
      <RNView
        style={[
          styles.creatorAvatar,
          {
            backgroundColor: colors.primary + "20",
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.creatorAvatarText, { color: colors.primary }]}>
          {creator.username.charAt(0).toUpperCase()}
        </Text>
      </RNView>
      <RNView style={styles.creatorInfo}>
        <Text style={[styles.creatorUsername, { color: colors.text }]}>
          {creator.username}
        </Text>
        <Text style={[styles.creatorChallenges, { color: colors.textSecondary }]}>
          {creator.challengeCount} retos creados
        </Text>
      </RNView>
    </TouchableOpacity>
  );
});

export default function CreatorsScreen() {
  const { completeUser } = useAuth();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];

  const { categories, loadUserCategories, loadTopCreators } = useUserCategories();
  const { searchCreator, searching } = useUsers();

  const [selectedCategory, setSelectedCategory] = useState<UserCategory | null>(null);
  const [creators, setCreators] = useState<CreatorChallengeCount[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResponseDTO[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<any>(null);
  
  // Profile modal states
  const [selectedCreator, setSelectedCreator] = useState<UserResponseDTO | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);

  // Cargar categorías del usuario al montar
  useEffect(() => {
    const loadCategories = async () => {
      if (!completeUser?.id) return;

      try {
        setLoadingCategories(true);
        await loadUserCategories(completeUser.id);
      } catch (error) {
        // Error manejado por el hook
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [completeUser?.id, loadUserCategories]);

  // Seleccionar la primera categoría automáticamente
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Cargar creadores cuando cambia la categoría seleccionada
  useEffect(() => {
    const fetchCreators = async () => {
      if (!selectedCategory) return;

      try {
        setLoadingCreators(true);
        const data = await loadTopCreators(selectedCategory.categoryId);
        setCreators(data);
      } catch (error) {
        setCreators([]);
      } finally {
        setLoadingCreators(false);
      }
    };

    fetchCreators();
  }, [selectedCategory, loadTopCreators]);

  // Debounced search handler
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const result = await searchCreator(text.trim());
      if (result) {
        setSearchResults([result]);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(true);
      }
    }, 500);
  }, [searchCreator]);

  // Cleanup search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleCategoryPress = useCallback((category: UserCategory) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

  const handleOpenProfile = useCallback(async (username: string) => {
    const creator = await searchCreator(username);
    if (creator) {
      setSelectedCreator(creator);
      setProfileVisible(true);
    }
  }, [searchCreator]);

  const handleSearchResultPress = useCallback((creator: UserResponseDTO) => {
    setSelectedCreator(creator);
    setProfileVisible(true);
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileVisible(false);
    setSelectedCreator(null);
  }, []);


  if (loadingCategories) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No tienes intereses registrados
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Agrega categorías de interés para ver los mejores creadores
          </Text>
        </View>
      </View>
    );
  }

  const topThree = creators.slice(0, 3);
  const remaining = creators.slice(3);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Top Creadores
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Descubre los creadores más activos en tus categorías de interés
          </Text>
        </View>

      {/* Search Section */}
      <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
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
            placeholder="Buscar creador por username..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searching && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          {searchQuery.length > 0 && !searching && (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <View
            style={[
              styles.searchResults,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {searchResults.length > 0 ? (
              searchResults.map((creator) => (
                <TouchableOpacity
                  key={creator.id}
                  style={[
                    styles.searchResultItem,
                    { borderBottomColor: colors.border },
                  ]}
                  onPress={() => handleSearchResultPress(creator)}
                >
                  <RNView
                    style={[
                      styles.searchResultAvatar,
                      {
                        backgroundColor: colors.primary + "20",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.searchResultAvatarText,
                        { color: colors.primary },
                      ]}
                    >
                      {creator.username.charAt(0).toUpperCase()}
                    </Text>
                  </RNView>
                  <RNView style={styles.searchResultInfo}>
                    <Text
                      style={[
                        styles.searchResultUsername,
                        { color: colors.text },
                      ]}
                    >
                      @{creator.username}
                    </Text>
                    <Text
                      style={[
                        styles.searchResultRole,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {creator.role} • {creator.points} puntos
                    </Text>
                  </RNView>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <RNView style={styles.searchResultEmpty}>
                <Text
                  style={[
                    styles.searchResultEmptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No se encontró ningún creador
                </Text>
              </RNView>
            )}
          </View>
        )}
      </View>

      {/* Scroll horizontal de categorías - ocultar durante búsqueda */}
      {!showSearchResults && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory?.id === category.id}
              onPress={() => handleCategoryPress(category)}
              colors={colors}
            />
          ))}
        </ScrollView>
      )}

      {/* Contenido principal - ocultar durante búsqueda */}
      {!showSearchResults && (
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loadingCreators ? (
            <RNView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Cargando creadores...
              </Text>
            </RNView>
          ) : creators.length === 0 ? (
            <RNView style={styles.emptyStateContainer}>
              <Ionicons
                name="trophy-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                No hay creadores en esta categoría
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Sé el primero en crear retos aquí
              </Text>
            </RNView>
          ) : (
            <>
              {/* Podio para top 3 */}
              {topThree.length > 0 && (
                <PodiumDisplay
                  creators={topThree}
                  colors={colors}
                  onCreatorPress={handleOpenProfile}
                />
              )}

              {/* Lista para el resto */}
              {remaining.length > 0 && (
                <RNView style={styles.remainingContainer}>
                  <Text style={[styles.remainingTitle, { color: colors.text }]}>
                    Otros Creadores Destacados
                  </Text>
                  {remaining.map((creator, index) => (
                    <CreatorListItem
                      key={creator.userId}
                      creator={creator}
                      rank={index + 4}
                      colors={colors}
                      onPress={() => handleOpenProfile(creator.username)}
                    />
                  ))}
                </RNView>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Creator Profile Modal */}
      <CreatorProfile
        visible={profileVisible}
        creator={selectedCreator}
        onClose={handleCloseProfile}
      />
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesScroll: {
    maxHeight: 100,
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  categoryCard: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    minWidth: 120,
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
  categoryCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryCardText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  // Podium styles
  podiumContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  podiumTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 16,
    paddingHorizontal: 10,
  },
  podiumItem: {
    flex: 1,
    alignItems: "center",
    maxWidth: 110,
  },
  podiumCreatorInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  podiumUsername: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  podiumChallenges: {
    fontSize: 12,
    textAlign: "center",
  },
  podiumBase: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
  },
  podiumPosition: {
    fontSize: 32,
    fontWeight: "bold",
  },
  // Remaining creators list styles
  remainingContainer: {
    marginTop: 8,
  },
  remainingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  creatorListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  creatorAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  creatorInfo: {
    flex: 1,
  },
  creatorUsername: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  creatorChallenges: {
    fontSize: 13,
  },
  // Search styles
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 12,
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
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchResultAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultUsername: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  searchResultRole: {
    fontSize: 12,
  },
  searchResultEmpty: {
    padding: 20,
    alignItems: "center",
  },
  searchResultEmptyText: {
    fontSize: 14,
  },
});
