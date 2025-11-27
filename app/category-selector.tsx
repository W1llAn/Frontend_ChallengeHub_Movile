import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useUserCategories } from "@/hooks/useUserCategories";
import { addUserCategory } from "@/services/category.service";
import type { Category } from "@/types/api/category.type";
import type { UserCategory } from "@/types/api/user-category.type";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { showNotifier } from "@/services/notifier";
import { getCategoryIcon } from "@/services/category-icons.service";

interface CategorySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

export default function CategorySelectorModal({
  visible,
  onClose,
  onCategoryAdded,
}: CategorySelectorModalProps) {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const { completeUser } = useAuth();
  
  const {
    categories,
    loading: categoriesLoading,
    loadAllCategories,
  } = useCategories();
  
  const {
    categories: userCategories,
    loadUserCategories,
    removeUserCategory,
  } = useUserCategories();

  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      await loadAllCategories();

      if (completeUser?.id) {
        const userCats = await loadUserCategories(completeUser.id);
        const userCategoryIds = new Set(userCats.map(uc => uc.categoryId));
        setSelectedCategories(userCategoryIds);
      }
    } catch (error) {
      showNotifier("Error al cargar categorías", "error");
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleSaveInterests = async () => {
    if (!completeUser?.id) {
      showNotifier("Error: Usuario no autenticado", "error");
      return;
    }

    if (selectedCategories.size === 0) {
      showNotifier("Debes tener al menos una categoría seleccionada", "warn");
      return;
    }

    setSaving(true);
    try {
      // Identificar categorías que ya tiene el usuario
      const existingCategoryIds = new Set(userCategories.map(uc => uc.categoryId));
      
      // Categorías a agregar (nuevas seleccionadas que no tiene)
      const newCategoriesToAdd = Array.from(selectedCategories).filter(
        categoryId => !existingCategoryIds.has(categoryId)
      );

      // Categorías a eliminar (que tenía pero ya no están seleccionadas)
      const categoriesToRemove = userCategories.filter(
        uc => !selectedCategories.has(uc.categoryId)
      );

      const promises: Promise<any>[] = [];

      // Agregar categorías nuevas
      newCategoriesToAdd.forEach((categoryId) => {
        promises.push(
          addUserCategory({
            userId: completeUser.id,
            categoryId,
          })
        );
      });

      // Eliminar categorías deseleccionadas
      categoriesToRemove.forEach((userCategory) => {
        promises.push(
          removeUserCategory({
            userId: completeUser.id,
            categoryId: userCategory.categoryId,
          })
        );
      });

      if (promises.length === 0) {
        showNotifier("No hay cambios para guardar", "info");
        onClose();
        return;
      }

      await Promise.all(promises);
      
      const added = newCategoriesToAdd.length;
      const removed = categoriesToRemove.length;
      let message = "";
      
      if (added > 0 && removed > 0) {
        message = `${added} ${added === 1 ? "categoría agregada" : "categorías agregadas"}, ${removed} ${removed === 1 ? "eliminada" : "eliminadas"}`;
      } else if (added > 0) {
        message = `${added} ${added === 1 ? "categoría agregada" : "categorías agregadas"}`;
      } else if (removed > 0) {
        message = `${removed} ${removed === 1 ? "categoría eliminada" : "categorías eliminadas"}`;
      }

      showNotifier(message, "success");
      setSelectedCategories(new Set());
      onCategoryAdded();
      onClose();
    } catch (error) {
      showNotifier("Error al guardar cambios", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.background, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            ¿Qué te desafía?
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Elige tus categorías favoritas para obtener desafíos personalizados.
          </Text>
        </View>

        {/* Categories Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {categoriesLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : (
            <View style={styles.grid}>
              {categories.map((category) => {
                const isSelected = selectedCategories.has(category.id);
                const iconName = getCategoryIcon(category.name);

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: 'transparent',
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    {/* Image */}
                    <RNView style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
                      {category.imageUrl ? (
                        <Image
                          source={{ uri: category.imageUrl }}
                          style={styles.categoryImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <RNView
                          style={[
                            styles.placeholderImage,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <Ionicons
                            name={iconName as any}
                            size={48}
                            color={colors.primary}
                          />
                        </RNView>
                      )}
                    </RNView>

                    {/* Category Name */}
                    <RNView style={[styles.categoryInfo, { backgroundColor: 'transparent' }]}>
                      <Text
                        style={[styles.categoryName, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {category.name}
                      </Text>
                    </RNView>

                    {/* Selection Indicator */}
                    <RNView style={styles.checkboxContainer}>
                      <RNView
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : "transparent",
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </RNView>
                    </RNView>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  selectedCategories.size > 0 ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSaveInterests}
            disabled={saving || selectedCategories.size === 0}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>
                Guardar Intereses
                {selectedCategories.size > 0 &&
                  ` (${selectedCategories.size})`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    marginTop: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  imageContainer: {
    width: "100%",
    height: 120,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    padding: 12,
    minHeight: 60,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  checkboxContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
