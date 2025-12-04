import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  View as RNView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getCategoryIcon } from '@/services/category-icons.service';
import { ChallengeStatus } from '@/types/api/challenge.type';
import { useReactions } from '@/hooks/useReactions';
import { useComments } from '@/hooks/useComments';

const { width } = Dimensions.get('window');

export default function ChallengeDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];

  // Parse challenge data from params
  const challenge = params.challenge ? JSON.parse(params.challenge as string) : null;

  // State
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Use reactions hook
  const {
    reactionCounts,
    loading: loadingReactions,
    handleReaction,
    refreshReactions,
  } = useReactions(challenge?.id);

  // Use comments hook
  const {
    comments,
    loading: loadingComments,
    submitting,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
    canEditComment,
    canDeleteComment,
    refreshComments,
  } = useComments(challenge?.id);

  const handlePostComment = async () => {
    if (commentText.trim()) {
      try {
        await handleCreateComment(commentText);
        setCommentText('');
      } catch (error) {
        Alert.alert('Error', 'No se pudo publicar el comentario');
      }
    }
  };

  const startEditComment = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const saveEdit = async () => {
    if (editingCommentId && editingText.trim()) {
      try {
        await handleUpdateComment(editingCommentId, editingText);
        setEditingCommentId(null);
        setEditingText('');
      } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar el comentario');
      }
    }
  };

  const confirmDelete = (commentId: number) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que deseas eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await handleDeleteComment(commentId);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el comentario');
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshReactions?.(),
        refreshComments(),
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!challenge) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>Error: No se encontró el reto</Text>
      </View>
    );
  }

  const getStatusConfig = () => {
    if (challenge.status === ChallengeStatus.ELIMINATED) {
      return { label: 'Eliminado', color: '#2196F3', backgroundColor: '#2196F320' };
    }
    if (challenge.status === ChallengeStatus.ACTIVE) {
      return { label: 'Activo', color: '#4CAF50', backgroundColor: '#4CAF5020' };
    }
    return { label: 'Inactivo', color: '#9E9E9E', backgroundColor: '#9E9E9E20' };
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detalle del Reto</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Challenge Image */}
        <View style={styles.imageContainer}>
          {challenge.imageUrl ? (
            <Image
              source={{ uri: challenge.imageUrl }}
              style={styles.challengeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons
                name={getCategoryIcon(challenge.categoryName) as any}
                size={80}
                color={colors.primary}
              />
            </View>
          )}
          
          {/* Category Badge Overlay */}
          <View style={styles.categoryBadgeOverlay}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
              <Ionicons
                name={getCategoryIcon(challenge.categoryName) as any}
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
                {challenge.categoryName}
              </Text>
            </View>
          </View>
        </View>
        {/* Reactions Bar - Facebook Style */}
          <View style={[styles.reactionsBar, { backgroundColor: 'transparent', borderBottomColor: colors.border }]}>
            {loadingReactions ? (
              <View style={styles.reactionsRow}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.reactionsRow}>
                {reactionCounts.map((reactionCount) => (
                  <TouchableOpacity
                    key={reactionCount.reaction.id}
                    style={[
                      styles.reactionButton,
                      {
                        backgroundColor: reactionCount.userReacted
                          ? colors.primary + '15'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleReaction(reactionCount.reaction.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reactionEmoji}>{reactionCount.reaction.iconUrl}</Text>
                    <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
                      {reactionCount.count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        {/* Main Content Container - No background */}
        <View style={[styles.contentContainer, { backgroundColor: 'transparent' }]}>
          {/* Title and Status */}
          <View style={[styles.titleSection, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>
              {challenge.title}
            </Text>
            <RNView style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </RNView>
          </View>

          {/* Creator Info */}
          <View style={[styles.creatorRow, { backgroundColor: 'transparent', borderBottomColor: colors.border }]}>
            <View style={[styles.creatorAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.creatorInitial, { color: colors.primary }]}>
                {challenge.creatorUsername?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.creatorInfo}>
              <Text style={[styles.creatorName, { color: colors.text }]}>
                {challenge.creatorUsername}
              </Text>
              <Text style={[styles.creatorLabel, { color: colors.textSecondary }]}>
                Creador del reto
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📝 Descripción</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {challenge.description}
            </Text>
          </View>

          {/* Objective */}
          {challenge.objective && (
            <View style={[styles.section, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Objetivo</Text>
              <Text style={[styles.objective, { color: colors.textSecondary }]}>
                {challenge.objective}
              </Text>
            </View>
          )}

          {/* Duration Info */}
          <View style={[styles.section, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Duración</Text>
            <View style={styles.durationGrid}>
              <View style={[styles.durationItem, { backgroundColor: 'transparent', borderColor: colors.border }]}>
                <Text style={[styles.durationLabel, { color: colors.textTertiary }]}>Inicio</Text>
                <Text style={[styles.durationValue, { color: colors.text }]}>
                  {new Date(challenge.startDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={[styles.durationItem, { backgroundColor: 'transparent', borderColor: colors.border }]}>
                <Text style={[styles.durationLabel, { color: colors.textTertiary }]}>Fin</Text>
                <Text style={[styles.durationValue, { color: colors.text }]}>
                  {new Date(challenge.endDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Button */}
          <TouchableOpacity
            style={[styles.progressButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.progressButtonText}>Registrar Avance</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

        

          {/* Comments Section */}
          <View style={[styles.commentsSection, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>
              💭 Comentarios ({comments.length})
            </Text>

            {/* Comment Input */}
            <View style={[styles.commentInputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <TextInput
                style={[styles.commentInput, { color: colors.text }]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                editable={!submitting}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: commentText.trim() && !submitting ? colors.primary : colors.border,
                  },
                ]}
                onPress={handlePostComment}
                disabled={!commentText.trim() || submitting}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={commentText.trim() ? '#FFFFFF' : colors.textTertiary}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyCommentsContainer}>
                <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.commentAvatarText, { color: colors.primary }]}>
                        {comment.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={[styles.commentUsername, { color: colors.text }]}>
                          {comment.userName}
                        </Text>
                        <Text style={[styles.commentTimestamp, { color: colors.textTertiary }]}>
                          {formatTimestamp(comment.createdAt)}
                        </Text>
                      </View>

                      {/* Editing mode */}
                      {editingCommentId === comment.id ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline
                            autoFocus
                          />
                          <View style={styles.editActions}>
                            <TouchableOpacity
                              style={[styles.editActionButton, { backgroundColor: colors.border }]}
                              onPress={cancelEdit}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.editActionText, { color: colors.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.editActionButton, { backgroundColor: colors.primary }]}
                              onPress={saveEdit}
                              disabled={!editingText.trim() || submitting}
                              activeOpacity={0.7}
                            >
                              {submitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Text style={[styles.editActionText, { color: '#FFFFFF' }]}>Guardar</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <>
                          <Text style={[styles.commentText, { color: colors.textSecondary }]}>
                            {comment.content}
                          </Text>
                          
                          {/* Actions for own comments */}
                          {(canEditComment(comment) || canDeleteComment(comment)) && (
                            <View style={styles.commentActions}>
                              {canEditComment(comment) && (
                                <TouchableOpacity
                                  style={styles.commentAction}
                                  onPress={() => startEditComment(comment.id, comment.content)}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="create-outline" size={16} color={colors.textTertiary} />
                                  <Text style={[styles.commentActionText, { color: colors.textTertiary }]}>
                                    Editar
                                  </Text>
                                </TouchableOpacity>
                              )}
                              {canDeleteComment(comment) && (
                                <TouchableOpacity
                                  style={styles.commentAction}
                                  onPress={() => confirmDelete(comment.id)}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                  <Text style={[styles.commentActionText, { color: '#EF4444' }]}>
                                    Eliminar
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
            </View>
          </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  challengeImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    marginRight: Spacing.sm,
    lineHeight: 30,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  creatorInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  creatorLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  objective: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  durationGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  durationItem: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  progressButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  reactionsBar: {
    marginTop: Spacing.md,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  reactionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: "2px",
    justifyContent: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: Spacing.sm,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingHorizontal: Spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    gap: Spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTimestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  commentActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCommentsContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  editContainer: {
    marginTop: Spacing.xs,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
    minHeight: 60,
    marginBottom: Spacing.xs,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'flex-end',
  },
  editActionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  editActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
