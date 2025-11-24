/**
 * DatePickerInput Component
 * Componente reutilizable para seleccionar fechas
 */
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  Platform,
} from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerInputProps {
  label?: string;
  placeholder?: string;
  value?: string; // formato YYYY-MM-DD
  onDateChange: (date: string) => void; // devuelve fecha en formato YYYY-MM-DD
  error?: string;
  containerStyle?: object;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  placeholder = "Seleccionar fecha",
  value,
  onDateChange,
  error,
  containerStyle,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Convertir string YYYY-MM-DD a Date
  const dateValue = value ? new Date(value + "T00:00:00") : new Date();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      // Convertir a formato YYYY-MM-DD
      const dateString = selectedDate.toISOString().split("T")[0];
      onDateChange(dateString);
    }
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
    dateButton: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      minHeight: 45,
      justifyContent: "center",
    },
    dateText: {
      fontSize: 14,
      color: value ? colors.text : colors.textTertiary,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
    },
  });

  return (
    <RNView style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}>
        <Text style={styles.dateText}>{formatDisplayDate(value)}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          onTouchCancel={() => setShowDatePicker(false)}
        />
      )}
    </RNView>
  );
};
