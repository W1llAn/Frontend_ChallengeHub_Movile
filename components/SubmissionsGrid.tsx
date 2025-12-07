import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  StyleSheet,
  FlatList,
  View as RNView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSubmissions } from '@/hooks/useSubmissions';
import { SubmissionResponseDTO } from '@/types/api/submission.type';
import { SubmissionCard } from './UI/SubmissionCard';
import { SubmissionDetailModal } from './UI/SubmissionDetailModal';

interface SubmissionsGridProps {
  userChallengeId: number;
  challengeTitle: string;
  onAddNew?: () => void;
  onEdit?: (submission: SubmissionResponseDTO) => void;
  onDelete?: (submissionId: number) => Promise<void>;
  onDownload?: (fileUrl: string, fileName: string) => void;
}

interface SubmissionsGridHandle {
  refresh: () => Promise<void>;
}

const { width } = Dimensions.get('window');

/**
 * Componente principal para mostrar avances en grid
 * Permite visualizar, expandir, editar y eliminar solo el último avance
 * Sigue principios de UX/UI con cards compactas y expandibles
 */
export const SubmissionsGrid = forwardRef<SubmissionsGridHandle, SubmissionsGridProps>(
  (
    {
      userChallengeId,
      challengeTitle,
      onAddNew,
      onEdit,
      onDelete,
      onDownload,
    }: SubmissionsGridProps,
    ref
  ) => {
    const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
    const colors = Colors[colorScheme];

    const { submissions, loading, loadSubmissionsByUserChallenge, deleteSubmission } = useSubmissions();
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDTO | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Cargar submissions cuando se monta el componente
    useEffect(() => {
      loadSubmissionsByUserChallenge(userChallengeId);
    }, [userChallengeId, loadSubmissionsByUserChallenge]);

    // Exponer función de refresh para que el padre pueda recargar
    useImperativeHandle(ref, () => ({
      refresh: async () => {
        await loadSubmissionsByUserChallenge(userChallengeId);
      },
    }), [userChallengeId, loadSubmissionsByUserChallenge]);

    // Ordenar submissions por fecha descendente (más reciente primero)
    const sortedSubmissions = [...submissions].sort(
      (a, b) => new Date(b.periodKey).getTime() - new Date(a.periodKey).getTime()
    );

    // El primer submission es el más reciente
    const isLatestSubmission = (submissionId: number): boolean => {
      return sortedSubmissions.length > 0 && sortedSubmissions[0].id === submissionId;
    };

    const handleCardPress = (submission: SubmissionResponseDTO) => {
      setSelectedSubmission(submission);
      setDetailModalVisible(true);
    };

    const handleEdit = () => {
      if (selectedSubmission && onEdit) {
        setDetailModalVisible(false);
        onEdit(selectedSubmission);
      }
    };

    const handleDelete = async () => {
      if (selectedSubmission) {
        await deleteSubmission(selectedSubmission.id);
        setDetailModalVisible(false);
        // No need to reload, deleteSubmission already updates the state
      }
    };

    const renderSubmissionCard = ({ item }: { item: SubmissionResponseDTO }) => (
      <SubmissionCard
        submission={item}
        isLatest={isLatestSubmission(item.id)}
        onPress={() => handleCardPress(item)}
        colors={colors}
      />
    );

    const renderEmptyState = () => (
      <View style={[styles.emptyState, { backgroundColor: 'transparent' }]}>
        <View style={[styles.emptyStateIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="document-text" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
          Sin avances aún
      </Text>
      <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
        Sube tu primer avance para empezar a ganar puntos
      </Text>
      {onAddNew && (
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
          onPress={onAddNew}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.emptyStateButtonText}>Registrar Avance</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: 'transparent' }]}>
      <View style={[styles.headerContent, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mis Avances
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {sortedSubmissions.length} {sortedSubmissions.length === 1 ? 'registro' : 'registros'}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={sortedSubmissions}
        renderItem={renderSubmissionCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        scrollEnabled={false}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Detail Modal */}
      <SubmissionDetailModal
        visible={detailModalVisible}
        submission={selectedSubmission}
        isLatest={selectedSubmission ? isLatestSubmission(selectedSubmission.id) : false}
        onClose={() => setDetailModalVisible(false)}
        onEdit={selectedSubmission && isLatestSubmission(selectedSubmission.id) ? handleEdit : undefined}
        onDelete={selectedSubmission && isLatestSubmission(selectedSubmission.id) ? handleDelete : undefined}
        onDownload={onDownload}
      />
    </View>
  );
});

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
    gap: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  gridRow: {
    gap: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptyStateMessage: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '80%',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
