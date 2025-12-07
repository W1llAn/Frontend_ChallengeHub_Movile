import React, { useEffect } from 'react';
import {
  StyleSheet,
  Modal,
  View as RNView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface BadgeUnlockedModalProps {
  visible: boolean;
  badgeName: string;
  badgeDescription: string;
  badgeDifficulty: string;
  badgeImageUrl?: string;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  visible,
  badgeName,
  badgeDescription,
  badgeDifficulty,
  badgeImageUrl,
  onClose,
}) => {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';
  const colors = Colors[colorScheme];
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  const getDifficultyColor = () => {
    switch (badgeDifficulty?.toLowerCase()) {
      case 'beginner':
        return '#FFD700'; // Gold for Bronze
      case 'intermediate':
        return '#C0C0C0'; // Silver
      case 'advanced':
        return '#FFD700'; // Gold
      case 'expert':
        return '#9D4EDD'; // Purple for Diamond
      default:
        return colors.primary;
    }
  };

  const getDifficultyLabel = () => {
    switch (badgeDifficulty?.toLowerCase()) {
      case 'beginner':
        return 'Bronce';
      case 'intermediate':
        return 'Plata';
      case 'advanced':
        return 'Oro';
      case 'expert':
        return 'Diamante';
      default:
        return badgeDifficulty;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <RNView style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: colors.backgroundSecondary,
              transform: [{ scale: scaleAnim }],
            },
            Shadows.large,
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Celebration Icon */}
          <View style={styles.celebrationIcon}>
            <Text style={styles.celebrationText}>🎉</Text>
          </View>

          {/* Badge Image or Icon */}
          <View
            style={[
              styles.badgeImageContainer,
              { borderColor: getDifficultyColor() },
            ]}
          >
            {badgeImageUrl ? (
              <Image
                source={{ uri: badgeImageUrl }}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons
                name="star"
                size={80}
                color={getDifficultyColor()}
              />
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            ¡Insignia Desbloqueada!
          </Text>

          {/* Badge Name */}
          <Text style={[styles.badgeName, { color: colors.text }]}>
            {badgeName}
          </Text>

          {/* Difficulty */}
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor() },
            ]}
          >
            <Text style={styles.difficultyText}>
              {getDifficultyLabel()}
            </Text>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {badgeDescription}
          </Text>

          {/* Achievement Message */}
          <Text style={[styles.achievementMessage, { color: colors.textSecondary }]}>
            ¡Felicidades por completar este logro! Continúa desafiándote.
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </Animated.View>
      </RNView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 350,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  celebrationIcon: {
    marginBottom: Spacing.md,
  },
  celebrationText: {
    fontSize: 48,
  },
  badgeImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badgeImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  achievementMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  closeModalButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
