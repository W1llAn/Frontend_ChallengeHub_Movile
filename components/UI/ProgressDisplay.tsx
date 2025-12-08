import React, { memo } from 'react';
import {
  View as RNView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';

interface ProgressDisplayProps {
  progress: number | undefined;
  status?: 'loading' | 'approved' | 'pending' | 'rejected';
  pointsEarned?: number;
  colors: typeof Colors.light;
}

/**
 * Componente para mostrar el progreso de un reto
 * Usado cuando un submission es aprobado automáticamente
 */
export const ProgressDisplay = memo(
  ({ progress, status, pointsEarned, colors }: ProgressDisplayProps) => {
    const progressValue = Math.min(Math.max(progress || 0, 0), 100);
    const isLoading = status === 'loading';
    const isApproved = status === 'approved';

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          Shadows.small,
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: 'transparent' }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.title, { color: colors.text }]}>Tu Progreso</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              En este reto
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressSection, { backgroundColor: 'transparent' }]}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressValue}%`,
                  backgroundColor: isApproved ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {progressValue}%
          </Text>
        </View>

        {/* Status and Points */}
        <View style={[styles.statusContainer, { backgroundColor: 'transparent', gap: Spacing.md }]}>
          {isLoading ? (
            <View style={[styles.loadingBox, { backgroundColor: colors.backgroundSecondary }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Actualizando progreso...
              </Text>
            </View>
          ) : (
            <>
              {isApproved && (
                <View
                  style={[
                    styles.statusBox,
                    {
                      backgroundColor: colors.success + '15',
                      borderColor: colors.success,
                    },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>
                    Avance aprobado automáticamente
                  </Text>
                </View>
              )}

              {pointsEarned !== undefined && pointsEarned > 0 && (
                <View
                  style={[
                    styles.pointsBox,
                    {
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Ionicons name="star" size={20} color={colors.primary} />
                  <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                      Puntos Ganados
                    </Text>
                    <Text style={[styles.pointsValue, { color: colors.primary }]}>
                      +{pointsEarned} puntos
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Info Footer */}
        <View
          style={[
            styles.infoFooter,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Tu progreso se actualiza automáticamente cuando se aprueban tus avances
          </Text>
        </View>
      </View>
    );
  }
);

ProgressDisplay.displayName = 'ProgressDisplay';

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressSection: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },
});
