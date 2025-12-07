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

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

/**
 * Card mejorado para mostrar un avance con mejor UI/UX
 * Muestra preview visual, fecha, tipo, estado y puntos
 */
export const SubmissionCard = memo(
  ({ submission, isLatest, onPress, colors }: SubmissionCardProps) => {
    const getStatusConfig = (status: SubmissionStatus) => {
      switch (status) {
        case 'APPROVED':
          return {
            icon: 'checkmark-circle',
            color: colors.success,
            backgroundColor: colors.success + '20',
            label: 'Aprobado',
          };
        case 'PENDING':
          return {
            icon: 'time',
            color: colors.warning,
            backgroundColor: colors.warning + '20',
            label: 'Pendiente',
          };
        case 'REJECTED':
          return {
            icon: 'close-circle',
            color: colors.error,
            backgroundColor: colors.error + '20',
            label: 'Rechazado',
          };
        default:
          return {
            icon: 'help-circle',
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
    });

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: isLatest ? colors.primary : colors.border,
            borderWidth: isLatest ? 2 : 1,
            width: cardWidth,
          },
          Shadows.small,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Latest Badge */}
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

        {/* Top Section: Icon and Status */}
        <View style={[styles.topSection, { backgroundColor: 'transparent' }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <Ionicons
              name={fileIcon}
              size={32}
              color={colors.primary}
            />
          </View>

          {/* Status Badge - Removed per design request */}
          {/* Previously showed checkmark/clock/X icon based on status */}
        </View>

        {/* Middle Section: Date and Type */}
        <View style={[styles.middleSection, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.type, { color: colors.text }]} numberOfLines={1}>
            {submission.type === 'PDF' ? 'PDF' : 'FOTO'}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formattedDate}
          </Text>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Bottom Section: Points or Feedback */}
        <View style={[styles.bottomSection, { backgroundColor: 'transparent' }]}>
          {submission.status === 'APPROVED' && submission.pointsAwarded > 0 && (
            <View style={[styles.pointsBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={[styles.pointsText, { color: colors.primary }]}>
                +{submission.pointsAwarded}
              </Text>
            </View>
          )}
          {submission.status === 'REJECTED' && submission.feedback && (
            <View style={[styles.feedbackPill]}>
              <Ionicons name="alert-circle" size={12} color={colors.error} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

SubmissionCard.displayName = 'SubmissionCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
  },
  latestBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  type: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '700',
  },
  feedbackPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
