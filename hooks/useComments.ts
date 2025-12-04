// hooks/useComments.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type {
    CommentResponseDTO,
    CommentCreateDTO,
    CommentUpdateDTO,
} from '@/types/api/comment.type';
import {
    getCommentsByChallenge,
    createComment,
    updateComment,
    deleteComment,
} from '@/services/comment.service';

export const useComments = (challengeId?: number) => {
    const { completeUser } = useAuth();
    const [comments, setComments] = useState<CommentResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Load comments when challengeId changes
    useEffect(() => {
        if (challengeId) {
            loadComments();
        } else {
            setLoading(false);
        }
    }, [challengeId]);

    const loadComments = async () => {
        if (!challengeId) {
            console.log('No challengeId provided');
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching comments for challenge:', challengeId);

            const fetchedComments = await getCommentsByChallenge(challengeId);
            console.log('Comments fetched:', fetchedComments);

            // Sort by creation date (newest first)
            const sortedComments = fetchedComments.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setComments(sortedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateComment = async (content: string) => {
        if (!completeUser?.id) {
            console.log('User not logged in - cannot comment');
            return;
        }

        if (!challengeId) {
            console.log('No challengeId provided');
            return;
        }

        if (!content.trim()) {
            console.log('Comment content is empty');
            return;
        }

        try {
            setSubmitting(true);
            console.log('Creating comment:', content);

            const dto: CommentCreateDTO = {
                content: content.trim(),
                userId: completeUser.id,
                challengeId,
            };

            const newComment = await createComment(dto);
            console.log('Comment created:', newComment);

            // Add new comment to the list (at the beginning)
            setComments((prev) => [newComment, ...prev]);
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateComment = async (commentId: number, content: string) => {
        if (!completeUser?.id) {
            console.log('User not logged in - cannot update');
            return;
        }

        if (!content.trim()) {
            console.log('Comment content is empty');
            return;
        }

        // Check if user owns the comment
        const comment = comments.find((c) => c.id === commentId);
        if (!comment || comment.userId !== completeUser.id) {
            console.log('Cannot update comment - not owner');
            return;
        }

        try {
            setSubmitting(true);
            console.log('Updating comment:', commentId);

            const dto: CommentUpdateDTO = {
                content: content.trim(),
            };

            const updatedComment = await updateComment(commentId, dto);
            console.log('Comment updated:', updatedComment);

            // Update comment in the list
            setComments((prev) =>
                prev.map((c) => (c.id === commentId ? updatedComment : c))
            );
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!completeUser?.id) {
            console.log('User not logged in - cannot delete');
            return;
        }

        // Check if user owns the comment
        const comment = comments.find((c) => c.id === commentId);
        if (!comment || comment.userId !== completeUser.id) {
            console.log('Cannot delete comment - not owner');
            return;
        }

        try {
            setSubmitting(true);
            console.log('Deleting comment:', commentId);

            await deleteComment(commentId);
            console.log('Comment deleted');

            // Remove comment from the list
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        } finally {
            setSubmitting(false);
        }
    };

    const canEditComment = (comment: CommentResponseDTO): boolean => {
        return !!completeUser && comment.userId === completeUser.id;
    };

    const canDeleteComment = (comment: CommentResponseDTO): boolean => {
        return !!completeUser && comment.userId === completeUser.id;
    };

    return {
        comments,
        loading,
        submitting,
        handleCreateComment,
        handleUpdateComment,
        handleDeleteComment,
        canEditComment,
        canDeleteComment,
        refreshComments: loadComments,
    };
};
