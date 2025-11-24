/**
 * Input Component
 * Componente reutilizable para campos de entrada
 */
import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View as RNView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "../useColorScheme";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: object;
  showFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  showFocus = true,
  ...props
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const [focused, setFocused] = useState(false);

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
    inputWrapper: {
      borderWidth: 1.5,
      borderColor: focused ? colors.primary : colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: multiline ? 12 : 10,
      backgroundColor: colors.surface,
      minHeight: multiline ? 100 : 45,
    },
    input: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
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
      <RNView style={styles.inputWrapper}>
        <TextInput
          {...props}
          style={styles.input}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            props.onBlur?.();
          }}
          placeholderTextColor={colors.textTertiary}
        />
      </RNView>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </RNView>
  );
};
