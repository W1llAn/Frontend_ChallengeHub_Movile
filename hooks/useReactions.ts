// hooks/useReactions.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Reaction, ReactionCount } from '@/types/api/reaction.type';
import {
    getAllReactions,
    getReactionsByChallenge,
    addReactionToChallenge,
    removeReactionFromChallenge,
} from '@/services/reaction.service';

export const useReactions = (challengeId?: number) => {
    const { completeUser } = useAuth();
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [reactionCounts, setReactionCounts] = useState<ReactionCount[]>([]);
    const [loading, setLoading] = useState(true);

    // Load reactions when challengeId or user changes
    useEffect(() => {
        console.log('useReactions effect:', { challengeId, userId: completeUser?.id });
        if (challengeId) {
            console.log('Loading reactions for challenge:', challengeId);
            loadReactions();
        } else {
            console.log('No challengeId provided');
            setLoading(false);
        }
    }, [challengeId, completeUser?.id]);

    const loadReactions = async () => {
        if (!challengeId) {
            console.log('No challengeId provided');
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching reactions for challenge:', challengeId);

            // Fetch available reactions and challenge reactions in parallel
            const [availableReactions, challengeReactions] = await Promise.all([
                getAllReactions(),
                getReactionsByChallenge(challengeId),
            ]);

            console.log('Available reactions:', availableReactions);
            console.log('Challenge reactions:', challengeReactions);

            setReactions(availableReactions);

            // Calculate reaction counts
            const counts: ReactionCount[] = availableReactions.map((reaction) => {
                const reactionsOfType = challengeReactions.filter(
                    (cr) => cr.reactionId === reaction.id
                );
                const userReacted = completeUser?.id
                    ? reactionsOfType.some((cr) => cr.userId === completeUser.id)
                    : false;

                return {
                    reaction,
                    count: reactionsOfType.length,
                    userReacted,
                };
            });
            setReactionCounts(counts);
        } catch (error) {
            console.error('Error loading reactions:', error);
            // Set empty arrays on error
            setReactions([]);
            setReactionCounts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (reactionId: number) => {
        if (!completeUser?.id) {
            console.log('User not logged in - cannot react');
            // TODO: Show login prompt
            return;
        }

        if (!challengeId) {
            console.log('No challengeId provided');
            return;
        }

        try {
            const reactionCount = reactionCounts.find((rc) => rc.reaction.id === reactionId);
            if (!reactionCount) return;

            console.log('Handling reaction:', { reactionId, userReacted: reactionCount.userReacted });

            if (reactionCount.userReacted) {
                // Remove reaction
                console.log('Removing reaction');
                await removeReactionFromChallenge(challengeId, completeUser.id);
            } else {
                // Add reaction
                console.log('Adding reaction');
                await addReactionToChallenge({
                    challengeId,
                    userId: completeUser.id,
                    reactionId,
                });
            }

            // Reload reactions to update counts
            await loadReactions();
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    };

    return {
        reactions,
        reactionCounts,
        loading,
        handleReaction,
        refreshReactions: loadReactions,
    };
};
