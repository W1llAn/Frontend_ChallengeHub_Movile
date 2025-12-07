import React, { useState } from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  View as RNView,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { SubmissionResponseDTO, SubmissionStatus } from '@/types/api/submission.type';
import { SubmissionPreview } from './SubmissionPreview';

interface SubmissionDetailModalProps {
  visible: boolean;
  submission: SubmissionResponseDTO | null;
  isLatest: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onDownload?: (fileUrl: string, fileName: string) => void;
}

/**
 * Modal para visualizar detalles completos de un submission
 * Muestra información, estado, retroalimentación y acciones
 * Solo permite editar/eliminar si es el avance más reciente
 */
export const SubmissionDetailModal = ({
  visible,
  submission,
  isLatest,
  onClose,
  onEdit,
  onDelete,
  onDownload,
}: SubmissionDetailModalProps) => {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];
  const [deleting, setDeleting] = useState(false);

  if (!submission) return null;

  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: 'checkmark-circle',
          color: colors.success,
          backgroundColor: colors.success + '20',
          label: 'Aprobado',
          description: 'Tu avance fue aprobado automáticamente',
        };
      case 'PENDING':
        return {
          icon: 'time',
          color: colors.warning,
          backgroundColor: colors.warning + '20',
          label: 'En revisión',
          description: 'Tu avance está siendo revisado',
        };
      case 'REJECTED':
        return {
          icon: 'close-circle',
          color: colors.error,
          backgroundColor: colors.error + '20',
          label: 'Rechazado',
          description: 'Tu avance fue rechazado',
        };
      default:
        return {
          icon: 'help-circle',
          color: colors.textSecondary,
          backgroundColor: colors.backgroundSecondary,
          label: 'Desconocido',
          description: 'Estado desconocido',
        };
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar avance',
      '¿Estás seguro de que deseas eliminar este avance? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (onDelete) {
              setDeleting(true);
              try {
                await onDelete();
                onClose();
              } catch (error) {
                Alert.alert('Error', 'No se pudo eliminar el avance');
              } finally {
                setDeleting(false);
              }
            }
          },
        },
      ]
    );
  };

  const statusConfig = getStatusConfig(submission.status);
  const formattedDate = new Date(submission.periodKey).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(submission.createdAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header con diseño mejorado */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Detalles
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: statusConfig.backgroundColor,
                borderColor: statusConfig.color,
              },
            ]}
          >
            <Ionicons
              name={statusConfig.icon as any}
              size={32}
              color={statusConfig.color}
            />
            <View style={[styles.statusInfo, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
              <Text style={[styles.statusDescription, { color: statusConfig.color }]}>
                {statusConfig.description}
              </Text>
            </View>
          </View>

          {/* Date and Type */}
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Información
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.infoItem, { backgroundColor: 'transparent' }]}>
                <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                <View style={[styles.infoContent, { backgroundColor: 'transparent' }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Fecha
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formattedDate}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border },
                ]}
              />

              <View style={[styles.infoItem, { backgroundColor: 'transparent' }]}>
                <Ionicons name="time" size={18} color={colors.textSecondary} />
                <View style={[styles.infoContent, { backgroundColor: 'transparent' }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Hora
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formattedTime}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.border },
                ]}
              />

              <View style={[styles.infoItem, { backgroundColor: 'transparent' }]}>
                <Ionicons
                  name={submission.type === 'PDF' ? 'document' : 'image'}
                  size={18}
                  color={colors.textSecondary}
                />
                <View style={[styles.infoContent, { backgroundColor: 'transparent' }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Tipo
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {submission.type === 'PDF' ? 'Documento PDF' : 'Foto'}
                  </Text>
                </View>
              </View>

              {submission.status === 'APPROVED' && submission.pointsAwarded > 0 && (
                <>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                  <View style={[styles.infoItem, { backgroundColor: 'transparent' }]}>
                    <Ionicons name="star" size={18} color={colors.primary} />
                    <View style={[styles.infoContent, { backgroundColor: 'transparent' }]}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Puntos Ganados
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.primary }]}>
                        +{submission.pointsAwarded} pts
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* File Preview */}
          {submission.files && submission.files.length > 0 && (
            <View style={[styles.section, { backgroundColor: 'transparent' }]}>
              <SubmissionPreview
                files={submission.files}
                colors={colors}
                onDownload={onDownload}
              />
            </View>
          )}

          {/* Feedback for Rejected */}
          {submission.status === 'REJECTED' && submission.feedback && (
            <View style={[styles.section, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Retroalimentación
              </Text>
              <View
                style={[
                  styles.feedbackBox,
                  {
                    backgroundColor: colors.error + '10',
                    borderColor: colors.error,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.feedbackText, { color: colors.text }]}>
                  {submission.feedback}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          {isLatest && (
            <View style={[styles.section, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Acciones
              </Text>

              <View style={[styles.actionsContainer, { backgroundColor: 'transparent' }]}>
                {submission.status === 'REJECTED' && onEdit && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.warning }]}
                    onPress={onEdit}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                )}

                {(submission.status === 'PENDING' || submission.status === 'APPROVED') && onEdit && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={onEdit}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                )}

                {onDelete && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: colors.error, 
                        opacity: deleting ? 0.6 : 1 
                      },
                    ]}
                    onPress={handleDelete}
                    disabled={deleting}
                    activeOpacity={0.8}
                  >
                    {deleting ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Eliminando...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="trash" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Eliminar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {!isLatest && (
                <Text style={[styles.disabledMessage, { color: colors.textSecondary }]}>
                  Solo puedes editar o eliminar tu último avance
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statusDescription: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledMessage: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
