import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    assignUserToChallenge,
    unassignUserFromChallenge,
    isUserSubscribed,
} from '@/services/user-challenge.service';

interface UseUserChallengeReturn {
    isSubscribed: boolean;
    loading: boolean;
    subscribing: boolean;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
    checkSubscription: () => Promise<void>;
}

export const useUserChallenge = (challengeId: number | undefined): UseUserChallengeReturn => {
    const { completeUser } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    const checkSubscription = async () => {
        if (!completeUser?.id || !challengeId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const subscribed = await isUserSubscribed(completeUser.id, challengeId);
            setIsSubscribed(subscribed);
        } catch (error) {
            console.error('Error checking subscription:', error);
            setIsSubscribed(false);
        } finally {
            setLoading(false);
        }
    };

    const subscribe = async () => {
        if (!completeUser?.id || !challengeId || subscribing) return;

        try {
            setSubscribing(true);
            await assignUserToChallenge({
                userId: completeUser.id,
                challengeId,
            });
            setIsSubscribed(true);
        } catch (error) {
            console.error('Error subscribing to challenge:', error);
            throw error;
        } finally {
            setSubscribing(false);
        }
    };

    const unsubscribe = async () => {
        if (!completeUser?.id || !challengeId || subscribing) return;

        try {
            setSubscribing(true);
            await unassignUserFromChallenge(completeUser.id, challengeId);
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error unsubscribing from challenge:', error);
            throw error;
        } finally {
            setSubscribing(false);
        }
    };

    useEffect(() => {
        checkSubscription();
    }, [challengeId, completeUser?.id]);

    return {
        isSubscribed,
        loading,
        subscribing,
        subscribe,
        unsubscribe,
        checkSubscription,
    };
};
