import React, { memo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { SubmissionResponseDTO, SubmissionStatus } from '@/types/api/submission.type';

interface SubmissionCardProps {
  submission: SubmissionResponseDTO;
  isLatest: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
}

/**
 * Card mejorado para mostrar un avance con mejor UI/UX
 * Muestra información clara: tipo, fecha, estado y puntos
 */
export const SubmissionCard = memo(
  ({ submission, isLatest, onPress, colors }: SubmissionCardProps) => {
    const getStatusConfig = (status: SubmissionStatus) => {
      switch (status) {
        case 'APPROVED':
          return {
            icon: 'checkmark-circle' as const,
            color: colors.success,
            backgroundColor: colors.success + '15',
            label: 'Aprobado',
          };
        case 'PENDING':
          return {
            icon: 'time' as const,
            color: colors.warning,
            backgroundColor: colors.warning + '15',
            label: 'Pendiente',
          };
        case 'REJECTED':
          return {
            icon: 'close-circle' as const,
            color: colors.error,
            backgroundColor: colors.error + '15',
            label: 'Rechazado',
          };
        default:
          return {
            icon: 'help-circle' as const,
            color: colors.textSecondary,
            backgroundColor: colors.backgroundSecondary,
            label: 'Desconocido',
          };
      }
    };

    const getFileIcon = (type: string) => {
      return type === 'PDF' ? 'document' : 'image';
    };

    const statusConfig = getStatusConfig(submission.status);
    const fileIcon = getFileIcon(submission.type);
    const formattedDate = new Date(submission.periodKey).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: isLatest ? colors.primary : colors.border,
            borderWidth: isLatest ? 2 : 1,
          },
          Shadows.small,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Header: Latest Badge */}
        {isLatest && (
          <View
            style={[
              styles.latestBadge,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="star-sharp" size={11} color="#FFFFFF" />
            <Text style={styles.latestBadgeText}>Reciente</Text>
          </View>
        )}

        {/* Icon and File Type */}
        <View style={[styles.headerSection, { backgroundColor: 'transparent' }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name={fileIcon}
              size={28}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.fileType, { color: colors.text }]}>
            {submission.type === 'PDF' ? 'PDF' : 'FOTO'}
          </Text>
        </View>

        {/* Date */}
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formattedDate}
        </Text>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.backgroundColor },
          ]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={14}
            color={statusConfig.color}
          />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Footer: Points or Feedback */}
        {submission.status === 'APPROVED' && submission.pointsAwarded > 0 && (
          <View style={[styles.pointsBadge, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="star" size={13} color={colors.primary} />
            <Text style={[styles.pointsText, { color: colors.primary }]}>
              +{submission.pointsAwarded} pts
            </Text>
          </View>
        )}
        {submission.status === 'REJECTED' && submission.feedback && (
          <View style={[styles.feedbackBadge, { backgroundColor: colors.error + '15' }]}>
            <Ionicons name="alert-circle" size={13} color={colors.error} />
            <Text style={[styles.feedbackText, { color: colors.error }]}>
              Con comentarios
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

SubmissionCard.displayName = 'SubmissionCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.xl, // Más espacio en la parte superior para el badge
    position: 'relative',
    minHeight: 220,
    justifyContent: 'space-between',
  },
  latestBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    zIndex: 10, // Asegurar que esté encima
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSection: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm, // Evitar superposición con el badge
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileType: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    marginVertical: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Deprecated styles - kept for reference
  topSection: {
    display: 'none',
  },
  middleSection: {
    display: 'none',
  },
  bottomSection: {
    display: 'none',
  },
  type: {
    display: 'none',
  },
  statusLabel: {
    display: 'none',
  },
  statusBadgeOld: {
    display: 'none',
  },
  feedbackPill: {
    display: 'none',
  },
});
