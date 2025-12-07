import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View as RNView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSubmissions } from '@/hooks/useSubmissions';
import { SubmissionResponseDTO, SubmissionStatus } from '@/types/api/submission.type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SubmissionsListScreenProps {
  userChallengeId: number;
  challengeTitle: string;
  onBack: () => void;
}

/**
 * Pantalla para ver el historial de submissions de un usuario en un reto
 * Muestra todos los avances registrados con sus estados y feedback
 */
export const SubmissionsListScreen = ({
  userChallengeId,
  challengeTitle,
  onBack,
}: SubmissionsListScreenProps) => {
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  const { submissions, loading, loadSubmissionsByUserChallenge } = useSubmissions();
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<number | null>(null);

  // Cargar submissions cuando se monta el componente
  useEffect(() => {
    loadSubmissionsByUserChallenge(userChallengeId);
  }, [userChallengeId]);

  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Aprobado',
          icon: 'checkmark-circle',
          color: '#4CAF50',
          backgroundColor: '#4CAF5020',
        };
      case 'REJECTED':
        return {
          label: 'Rechazado',
          icon: 'close-circle',
          color: '#F44336',
          backgroundColor: '#F4433620',
        };
      case 'PENDING':
        return {
          label: 'Pendiente',
          icon: 'hourglass',
          color: '#FF9800',
          backgroundColor: '#FF980020',
        };
      default:
        return {
          label: 'Desconocido',
          icon: 'help-circle',
          color: '#9E9E9E',
          backgroundColor: '#9E9E9E20',
        };
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSubmissionCard = ({ item }: { item: SubmissionResponseDTO }) => {
    const statusConfig = getStatusConfig(item.status);
    const isExpanded = expandedSubmissionId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.submissionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          Shadows.small,
        ]}
        onPress={() => setExpandedSubmissionId(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={[styles.cardHeader, { backgroundColor: 'transparent' }]}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={[styles.submissionDate, { color: colors.text }]}>
              Período: {item.periodKey}
            </Text>
            <Text style={[styles.submissionType, { color: colors.textSecondary }]}>
              Tipo: {item.type === 'PDF' ? '📄 PDF' : '🖼️ Foto'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusConfig.backgroundColor,
                borderColor: statusConfig.color,
              },
            ]}
          >
            <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} />
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Expandible Content */}
        {isExpanded && (
          <View style={[styles.expandedContent, { backgroundColor: 'transparent' }]}>
            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Uploaded Files */}
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Archivos ({item.files?.length || 0})
              </Text>
              {item.files && item.files.length > 0 ? (
                item.files.map((file, index) => (
                  <View
                    key={file.id}
                    style={[
                      styles.fileItem,
                      { backgroundColor: colors.backgroundSecondary },
                    ]}
                  >
                    <Ionicons
                      name={item.type === 'PDF' ? 'document' : 'image'}
                      size={16}
                      color={colors.primary}
                    />
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <Text
                        style={[styles.fileName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {file.file?.objectKey?.split('/').pop() || 'archivo.pdf'}
                      </Text>
                      <Text style={[styles.fileSize, { color: colors.textTertiary }]}>
                        {file.file?.sizeBytes
                          ? `${(file.file.sizeBytes / 1024).toFixed(2)} KB`
                          : 'Sin info'}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.noFiles, { color: colors.textSecondary }]}>
                  No hay archivos
                </Text>
              )}
            </View>

            {/* Points */}
            {item.status === 'APPROVED' && (
              <View
                style={[
                  styles.pointsContainer,
                  {
                    backgroundColor: colors.success + '15',
                    borderColor: colors.success,
                  },
                ]}
              >
                <Ionicons name="star" size={18} color={colors.success} />
                <Text style={[styles.pointsText, { color: colors.success }]}>
                  +{item.pointsAwarded} puntos
                </Text>
              </View>
            )}

            {/* Feedback */}
            {item.feedback && (
              <View style={{ gap: Spacing.xs }}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>
                  Comentario del revisor
                </Text>
                <View
                  style={[
                    styles.feedbackBox,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.primary + '50',
                    },
                  ]}
                >
                  <Text
                    style={[styles.feedbackText, { color: colors.text }]}
                  >
                    {item.feedback}
                  </Text>
                </View>
              </View>
            )}

            {/* Meta Info */}
            <View style={[styles.metaInfo, { backgroundColor: 'transparent' }]}>
              <View style={{ gap: Spacing.xs }}>
                <View style={[styles.metaItem, { backgroundColor: 'transparent' }]}>
                  <Ionicons
                    name="calendar"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                    Creado: {formatDate(item.createdAt)}
                  </Text>
                </View>

                {item.reviewedAt && (
                  <View style={[styles.metaItem, { backgroundColor: 'transparent' }]}>
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                      Revisado: {formatDate(item.reviewedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Expand Icon */}
        <View style={[styles.expandIcon, { backgroundColor: 'transparent' }]}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const emptyComponent = (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Sin avances registrados
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Registra tu primer avance en este reto
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Avances</Text>
        <RNView style={{ width: 24 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderSubmissionCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={emptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  submissionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  submissionDate: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  submissionType: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandedContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  noFiles: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 12,
    lineHeight: 18,
  },
  metaInfo: {
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  expandIcon: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
