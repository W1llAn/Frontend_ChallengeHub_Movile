/**
 * ReportModal Component
 * Modal reutilizable para reportar usuarios, retos o comentarios
 */
import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  View as RNView,
  Dimensions,
} from "react-native";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { Input, Select, Button } from "@/components/UI";
import { useReports } from "@/hooks/useReports";
import type {
  ReportObjectType,
  ReportReason,
  REPORT_REASONS,
} from "@/types/api/report.type";
import { REPORT_REASONS as REASONS_OPTIONS } from "@/types/api/report.type";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  objectType: ReportObjectType;
  objectId: number;
  reporterId: number;
  objectName?: string; // Nombre del objeto para mostrar en el título
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  objectType,
  objectId,
  reporterId,
  objectName,
}) => {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const { loading, error, submitReport, clearError } = useReports();

  const [title, setTitle] = useState("");
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    reason?: string;
    description?: string;
  }>({});

  // Limpiar formulario al abrir/cerrar
  useEffect(() => {
    if (visible) {
      setTitle("");
      setReason("");
      setDescription("");
      setErrors({});
      setShowSuccessModal(false);
      clearError();
    }
  }, [visible]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (title.length > 50) {
      newErrors.title = "El título no puede exceder 50 caracteres";
    }

    if (!reason) {
      newErrors.reason = "Debes seleccionar una razón";
    }

    if (!description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (description.length > 100) {
      newErrors.description = "La descripción no puede exceder 100 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const success = await submitReport({
      title: title.trim(),
      reason: reason as ReportReason,
      description: description.trim(),
      objectType,
      objectId,
      reporterId,
    });

    if (success) {
      // Mostrar modal de éxito
      setShowSuccessModal(true);
      // Cerrar ambos modales después de 3 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 3000);
    }
  };

  const getObjectTypeLabel = () => {
    switch (objectType) {
      case "CHALLENGE":
        return "reto";
      case "USER":
        return "usuario";
      case "COMMENT":
        return "comentario";
      default:
        return "elemento";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          style={styles.avoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              {/* Header */}
              <RNView style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Reportar {getObjectTypeLabel()}
                </Text>
                {objectName && (
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    "{objectName}"
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </RNView>

              {/* Error Banner */}
              {error && (
                <RNView style={[styles.errorBanner, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <Text style={[styles.errorText, { color: '#92400E' }]}>
                    {error}
                  </Text>
                </RNView>
              )}

              {/* Content */}
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <RNView style={styles.inputGroup}>
                  <Input
                    label="Título del reporte"
                    placeholder="Escribe un título breve..."
                    value={title}
                    onChangeText={setTitle}
                    maxLength={50}
                    error={errors.title}
                  />
                  <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                    {title.length}/50 caracteres
                  </Text>
                </RNView>

                <RNView style={styles.inputGroup}>
                  <Select
                    label="Razón del reporte"
                    placeholder="Selecciona una razón"
                    value={reason}
                    onValueChange={(value) => setReason(value as ReportReason)}
                    options={REASONS_OPTIONS}
                    error={errors.reason}
                  />
                </RNView>

                <RNView style={styles.inputGroup}>
                  <Input
                    label="Descripción"
                    placeholder="Describe el problema con detalle..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={100}
                    error={errors.description}
                  />
                  <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                    {description.length}/100 caracteres
                  </Text>
                </RNView>

                <RNView style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Tu reporte será revisado por nuestro equipo. Todos los reportes son
                    confidenciales.
                  </Text>
                </RNView>
              </ScrollView>

              {/* Footer */}
              <RNView style={[styles.footer, { borderTopColor: colors.border }]}>
                <Button
                  label="Cancelar"
                  onPress={onClose}
                  variant="outline"
                  fullWidth={false}
                  disabled={loading}
                  style={styles.footerButton}
                />
                <Button
                  label="Enviar reporte"
                  onPress={handleSubmit}
                  variant="primary"
                  fullWidth={false}
                  loading={loading}
                  style={styles.footerButton}
                />
              </RNView>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.successOverlay}>
          <View style={[styles.successModal, { backgroundColor: colors.background }]}>
            <RNView style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </RNView>
            <Text style={[styles.successTitle, { color: colors.text }]}>
              ¡Reporte Enviado!
            </Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Gracias por tu colaboración. Tu reporte ha sido enviado exitosamente y será revisado por nuestro equipo de administración.
            </Text>
            <RNView style={styles.successCheckmark}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={[styles.successNote, { color: colors.textSecondary }]}>
                Tu reporte es confidencial
              </Text>
            </RNView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  avoidingView: {
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    position: "relative",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    paddingRight: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    fontWeight: "500",
  },
  content: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  contentContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
  },
  footerButton: {
    minWidth: 120,
    marginLeft: 12,
  },
  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModal: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  successCheckmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  successNote: {
    fontSize: 14,
    fontWeight: "500",
  },
});
