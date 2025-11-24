/**
 * Select Component
 * Componente reutilizable para selecciones
 */
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  containerStyle?: object;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = "Seleccionar",
  value,
  onValueChange,
  options,
  error,
  containerStyle,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const styles = StyleSheet.create({
    container: {
      marginBottom: error ? 8 : 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    selectButton: {
      borderWidth: 1.5,
      borderColor: visible ? colors.primary : colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      minHeight: 45,
      justifyContent: "center",
    },
    selectText: {
      fontSize: 14,
      color: value ? colors.text : colors.textTertiary,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
    },
    modal: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "80%",
      paddingBottom: 20,
    },
    modalHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    optionButton: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
    },
    selectedOptionText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600",
    },
  });

  const handleSelectOption = (optionValue: string) => {
    onValueChange(optionValue);
    setVisible(false);
  };

  return (
    <RNView style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}>
        <Text style={styles.selectText}>
          {selectedOption?.label || placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}>
        <RNView style={styles.modal}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setVisible(false)}
            activeOpacity={1}
          />
          <RNView style={styles.modalContent}>
            <RNView style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
            </RNView>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionButton}
                  onPress={() => handleSelectOption(option.value)}
                  activeOpacity={0.7}>
                  <Text
                    style={
                      value === option.value
                        ? styles.selectedOptionText
                        : styles.optionText
                    }>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </RNView>
        </RNView>
      </Modal>
    </RNView>
  );
};
