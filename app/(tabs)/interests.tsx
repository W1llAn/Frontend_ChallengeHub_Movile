import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
  Modal,
  PanResponder,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCategories } from "@/hooks/useUserCategories";
import type { UserCategory, UserCategoryChallenge } from "@/types/api/user-category.type";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { getCategoryIcon } from "@/services/category-icons.service";
import { Ionicons } from "@expo/vector-icons";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { showNotifier } from "@/services/notifier";
import CategorySelectorModal from "../category-selector";

const DeleteConfirmationModal: React.FC<{
  visible: boolean;
  categoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
  colors: any;
}> = ({ visible, categoryName, onConfirm, onCancel, colors }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalIconContainer, { backgroundColor: "#FFE5E5" }]}>
            <Ionicons name="trash" size={32} color="#E53935" />
          </View>
          
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Confirmar eliminación
          </Text>
          
          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
            ¿Estás seguro de que quieres eliminar la categoría '{categoryName}'? Esta acción no se puede deshacer.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButtonModal]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ChallengeItem: React.FC<{
  challenge: UserCategoryChallenge;
  colors: any;
}> = ({ challenge, colors }) => {
  const getStatusConfig = (status: string, progressPercent: number) => {
    if (progressPercent === 100 || status === "COMPLETED") {
      return { label: "Completado", color: "#2196F3", backgroundColor: "#2196F320" };
    }
    if (status === "ACTIVE") {
      return { label: "Activo", color: "#4CAF50", backgroundColor: "#4CAF5020" };
    }
    return { label: "Pendiente", color: "#9E9E9E", backgroundColor: "#9E9E9E20" };
  };

  const statusConfig = getStatusConfig(challenge.status, challenge.progressPercent);

  return (
    <View style={[styles.challengeItem, { backgroundColor: colors.backgroundSecondary }]}>
      <RNView style={styles.challengeHeader}>
        <Text style={[styles.challengeTitle, { color: colors.text }]}>
          {challenge.title}
        </Text>
        <RNView style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </RNView>
      </RNView>
      
      <RNView style={styles.progressContainer}>
        <RNView style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
          <RNView
            style={[
              styles.progressBarFill,
              {
                width: `${challenge.progressPercent}%`,
                backgroundColor: statusConfig.color,
              },
            ]}
          />
        </RNView>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {challenge.progressPercent}%
        </Text>
      </RNView>
    </View>
  );
};

const CategoryCard: React.FC<{
  category: UserCategory;
  onToggle: () => void;
  onDelete: () => void;
  isExpanded: boolean;
  challenges: UserCategoryChallenge[];
  loadingChallenges: boolean;
  colors: any;
}> = ({ category, onToggle, onDelete, isExpanded, challenges, loadingChallenges, colors }) => {
  const [swipeX] = useState(new Animated.Value(0));
  const [showDelete, setShowDelete] = useState(false);

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
        <TouchableOpacity style={styles.categoryContent} onPress={onToggle}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name={getCategoryIcon(category.categoryName) as any} size={24} color={colors.primary} />
          </View>
          <RNView style={styles.categoryInfo}>
            <Text style={[styles.categoryName, { color: colors.text }]}>
              {category.categoryName}
            </Text>
          </RNView>
          <Ionicons 
            name={isExpanded ? "chevron-down" : "chevron-forward"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.challengesContainer}>
            {loadingChallenges ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.challengesLoader} />
            ) : challenges.length === 0 ? (
              <Text style={[styles.noChallengesText, { color: colors.textSecondary }]}>
                No hay desafíos en esta categoría
              </Text>
            ) : (
              challenges.map((challenge) => (
                <ChallengeItem
                  key={challenge.challengeId}
                  challenge={challenge}
                  colors={colors}
                />
              ))
            )}
          </View>
        )}
      </Animated.View>

      {showDelete && (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={() => {
            handleSwipe("right");
            onDelete();
          }}
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function InterestsScreen() {
  const { user, completeUser } = useAuth();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  
  const {
    categories,
    loading: categoriesLoading,
    loadUserCategories,
    removeUserCategory,
    loadChallenges,
    setCategories,
  } = useUserCategories();

  const [filteredCategories, setFilteredCategories] = useState<UserCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [categoryChallenges, setCategoryChallenges] = useState<Record<number, UserCategoryChallenge[]>>({});
  const [loadingChallenges, setLoadingChallenges] = useState<Record<number, boolean>>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<UserCategory | null>(null);
  const [categorySelectorVisible, setCategorySelectorVisible] = useState(false);

  const loadCategories = useCallback(async () => {
    const userId = completeUser?.id;
    
    if (!userId) {
      return;
    }

    try {
      await loadUserCategories(userId);
    } finally {
      setRefreshing(false);
    }
  }, [completeUser?.id, loadUserCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const unsubscribe = () => {
      loadCategories();
    };
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.categoryName
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handleDeleteCategory = useCallback(async (category: UserCategory) => {
    if (!completeUser?.id) {
      return;
    }

    try {
      await removeUserCategory({
        userId: completeUser.id,
        categoryId: category.categoryId,
      });

      const updatedCategories = categories.filter(
        (c) => c.categoryId !== category.categoryId
      );
      setCategories(updatedCategories);
      setFilteredCategories(
        updatedCategories.filter((c) =>
          c.categoryName.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      );
    } catch (error) {
      // Error ya manejado por el hook
    }
  }, [completeUser?.id, categories, searchQuery, removeUserCategory, setCategories]);

  // Manejar toggle de categoría (expandir/colapsar)
  const handleToggleCategory = useCallback(async (category: UserCategory) => {
    const isExpanding = expandedCategoryId !== category.categoryId;
    
    if (isExpanding) {
      setExpandedCategoryId(category.categoryId);
      
      if (!categoryChallenges[category.categoryId] && completeUser?.id) {
        setLoadingChallenges(prev => ({ ...prev, [category.categoryId]: true }));
        
        try {
          const challenges = await loadChallenges({
            userId: completeUser.id,
            categoryId: category.categoryId,
          });
          
          setCategoryChallenges(prev => ({
            ...prev,
            [category.categoryId]: challenges,
          }));
        } catch (error) {
          setCategoryChallenges(prev => ({
            ...prev,
            [category.categoryId]: [],
          }));
        } finally {
          setLoadingChallenges(prev => ({ ...prev, [category.categoryId]: false }));
        }
      }
    } else {
      setExpandedCategoryId(null);
    }
  }, [expandedCategoryId, categoryChallenges, completeUser?.id, loadChallenges]);

  const handleDeletePress = (category: UserCategory) => {
    setCategoryToDelete(category);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || !completeUser?.id) return;

    setDeleteModalVisible(false);

    try {
      await removeUserCategory({
        userId: completeUser.id,
        categoryId: categoryToDelete.categoryId,
      });

      const updatedCategories = categories.filter(
        (c) => c.categoryId !== categoryToDelete.categoryId
      );
      setCategories(updatedCategories);
      setFilteredCategories(
        updatedCategories.filter((c) =>
          c.categoryName.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      );
      
      if (expandedCategoryId === categoryToDelete.categoryId) {
        setExpandedCategoryId(null);
      }
      
      const { [categoryToDelete.categoryId]: _, ...restChallenges } = categoryChallenges;
      setCategoryChallenges(restChallenges);
      
    } catch (error) {
      // Error ya manejado por el hook
    } finally {
      setCategoryToDelete(null);
    }
  };
  
  if (categoriesLoading && categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.header, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Mis Intereses
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Gestiona tus intereses y sigue el progreso de tus desafíos activos.
        </Text>
      </View>

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
          placeholder="Buscar entre mis intereses..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="file-tray-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery
                ? "No se encontraron categorías"
                : "No tienes intereses registrados"}
            </Text>
            {!searchQuery && (
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Explora y agrega categorías que te interesen
              </Text>
            )}
          </View>
        ) : (
          <>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onToggle={() => handleToggleCategory(category)}
                onDelete={() => handleDeletePress(category)}
                isExpanded={expandedCategoryId === category.categoryId}
                challenges={categoryChallenges[category.categoryId] || []}
                loadingChallenges={loadingChallenges[category.categoryId] || false}
                colors={colors}
              />
            ))}
          </>
        )}
      </ScrollView>

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        categoryName={categoryToDelete?.categoryName || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
        }}
        colors={colors}
      />

      <CategorySelectorModal
        visible={categorySelectorVisible}
        onClose={() => setCategorySelectorVisible(false)}
        onCategoryAdded={() => {
          loadCategories();
        }}
      />

      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: colors.primary }]}
        onPress={() => setCategorySelectorVisible(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Agregar nuevo  interés </Text>
      </TouchableOpacity>
    </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  categoryWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  categoryCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
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
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
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
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
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
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonModal: {
    backgroundColor: "#E53935",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  challengesContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  challengesLoader: {
    paddingVertical: 20,
  },
  noChallengesText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  challengeItem: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  challengeTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 35,
    textAlign: "right",
  },
});

