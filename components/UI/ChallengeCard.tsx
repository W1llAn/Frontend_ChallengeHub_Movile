import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  View as RNView,
  Platform
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { getCategoryIcon } from '@/services/category-icons.service';
import type { Challenge } from '@/types/api/challenge.type';
import { ChallengeStatus } from '@/types/api/challenge.type';
import { useRouter } from 'expo-router';

interface ChallengeCardProps {
  challenge: Challenge | { challenge: Challenge };
  colors: typeof Colors.light;
  onPress?: (challenge: Challenge) => void;
  onDelete?: (challenge: Challenge) => void;
  showSwipeToDelete?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge: challengeProp,
  colors,
  onPress,
  onDelete,
  showSwipeToDelete = false,
}) => {
  const router = useRouter();
  
  // Handle both direct challenge and nested challenge object
  const challenge = 'challenge' in challengeProp ? challengeProp.challenge : challengeProp;
  
  const [swipeX] = useState(new Animated.Value(0));
  const [showDelete, setShowDelete] = useState(false);

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(challenge);
    } else {
      // Default navigation to detail screen
      router.push({
        pathname: '/challenge-detail',
        params: { challenge: JSON.stringify(challenge) }
      });
    }
  };

  const daysRemaining = getDaysRemaining(challenge.endDate);
  const isActive = challenge.status === ChallengeStatus.ACTIVE;
  const isEliminated = challenge.status === ChallengeStatus.ELIMINATED;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return showSwipeToDelete && Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!showSwipeToDelete) return;
        if (gestureState.dx < 0) {
          swipeX.setValue(Math.max(gestureState.dx, -80));
        } else if (showDelete) {
          swipeX.setValue(Math.min(gestureState.dx - 80, 0));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!showSwipeToDelete) return;
        if (gestureState.dx < -40 && !showDelete) {
          handleSwipe("left");
        } else if (gestureState.dx > 40 || (gestureState.dx > -40 && !showDelete)) {
          handleSwipe("right");
        } else if (showDelete && gestureState.dx > -40 && gestureState.dx < 40) {
          handleSwipe("left");
        }
      },
    })
  ).current;

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      Animated.timing(swipeX, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowDelete(true));
    } else {
      Animated.timing(swipeX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowDelete(false));
    }
  };

  const getStatusConfig = () => {
    if (isEliminated) {
      return { label: "Eliminado", color: "#2196F3", backgroundColor: "#2196F320" };
    }
    if (isActive) {
      return { label: "Activo", color: "#4CAF50", backgroundColor: "#4CAF5020" };
    }
    return { label: "Inactivo", color: "#9E9E9E", backgroundColor: "#9E9E9E20" };
  };

  const statusConfig = getStatusConfig();

  const styles = StyleSheet.create({
    categoryWrapper: {
      position: "relative",
      marginBottom: 16,
    },
    categoryCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    fullCardTouchable: {
      flex: 1,
    },
    imageContainer: {
      height: 140,
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
    placeholderText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
    },
    imageOverlay: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      backgroundColor: 'transparent',
    },
    overlayBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    overlayBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    categoryContent: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    categoryInfo: {
      flex: 1,
      marginRight: 12,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
      lineHeight: 22,
    },
    categorySubtitle: {
      fontSize: 13,
      opacity: 0.7,
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
    },
    deleteButton: {
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: 80,
      justifyContent: "center",
      alignItems: "center",
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
    },
  });

  return (
    <View style={styles.categoryWrapper}>
      <Animated.View
        style={[
          styles.categoryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ translateX: swipeX }],
          },
        ]}
        {...(showSwipeToDelete ? panResponder.panHandlers : {})}
      >
        {/* TouchableOpacity that covers the entire card including the image */}
        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.7}
          style={styles.fullCardTouchable}
        >
          {/* Large rectangular image */}
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
                  size={40}
                  color={colors.primary}
                />
                <Text style={[styles.placeholderText, { color: colors.primary }]}>
                  {challenge.categoryName}
                </Text>
              </View>
            )}

            {/* Overlay with quick information */}
            <View style={styles.imageOverlay}>
              <View style={[styles.overlayBadge]}>
                <Ionicons
                  name={getCategoryIcon(challenge.categoryName) as any}
                  size={12}
                  color={colors.text}
                />
                <Text style={[styles.overlayBadgeText, { color: colors.text }]}>
                  {challenge.categoryName}
                </Text>
              </View>

              {isActive && (
                <View style={[styles.overlayBadge]}>
                  <Text style={[styles.overlayBadgeText, { color: colors.text }]}>
                    {daysRemaining}d
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Card content */}
          <View style={styles.categoryContent}>
            <RNView style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
                {challenge.title}
              </Text>
              <Text style={[styles.categorySubtitle, { color: colors.textSecondary }]}>
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </Text>
            </RNView>

            <RNView style={styles.rightContent}>
              <RNView style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </RNView>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </RNView>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {showDelete && showSwipeToDelete && (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={() => {
            handleSwipe("right");
            onDelete?.(challenge);
          }}
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};
