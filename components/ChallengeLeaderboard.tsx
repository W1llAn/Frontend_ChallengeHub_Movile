import React from 'react';
import { StyleSheet, View as RNView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors, { BorderRadius, Shadows, Spacing } from '@/constants/Colors';
import { useChallengeTopScores, UserScore } from '@/hooks/useChallengeTopScores';

interface ChallengeLeaderboardProps {
  challengeId: number | null | undefined;
  colors: typeof Colors.light;
}

/**
 * Componente que muestra el top 3 de usuarios con mayor puntuación en un reto
 * Muestra medals (🥇🥈🥉), nombre, puntos y barra de progreso
 */
export const ChallengeLeaderboard = ({ challengeId, colors }: ChallengeLeaderboardProps) => {
  const { topScores, loading, error } = useChallengeTopScores(challengeId);

  // No mostrar nada si no hay challenge o no hay datos
  if (!challengeId || (topScores.length === 0 && !loading)) {
    return null;
  }

  const getMedalIcon = (position: number): string => {
    switch (position) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '•';
    }
  };

  const getMedalColor = (position: number): string => {
    switch (position) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <View style={[styles.titleContainer, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.title, { color: colors.text }]}>🏆 Top 3 Leaderboard</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Mejores calificaciones en este reto
          </Text>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
          <Ionicons name="alert-circle" size={20} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            No se pudo cargar el leaderboard
          </Text>
        </View>
      ) : topScores.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aún no hay participantes en este reto
          </Text>
        </View>
      ) : (
        /* Leaderboard Items */
        <View style={[styles.leaderboardContainer, { backgroundColor: 'transparent' }]}>
          {topScores.map((user, index) => (
            <LeaderboardRow
              key={user.userId}
              position={index + 1}
              user={user}
              medal={getMedalIcon(index)}
              medalColor={getMedalColor(index)}
              colors={colors}
            />
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Componente para renderizar una fila del leaderboard
 */
interface LeaderboardRowProps {
  position: number;
  user: UserScore;
  medal: string;
  medalColor: string;
  colors: typeof Colors.light;
}

function LeaderboardRow({ position, user, medal, medalColor, colors }: LeaderboardRowProps) {
  const progressWidth = Math.min(user.progressPercent, 100);

  return (
    <View
      style={[
        styles.leaderboardRow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Medal */}
      <View style={[styles.medalContainer, { backgroundColor: medalColor + '20' }]}>
        <Text style={styles.medalIcon}>{medal}</Text>
      </View>

      {/* User Info and Stats */}
      <View style={[styles.userContent, { backgroundColor: 'transparent' }]}>
        {/* Username and Position */}
        <View style={[styles.userHeader, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
            {user.username}
          </Text>
          <Text style={[styles.points, { color: colors.primary }]}>
            {user.totalPoints.toLocaleString()} pts
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <RNView
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primary,
                width: `${progressWidth}%`,
              },
            ]}
          />
        </View>

        {/* Stats Footer */}
        <View style={[styles.statsFooter, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {user.approvedSubmissionsCount} envíos
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            {user.progressPercent}% completo
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.sm,
  },
  titleContainer: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  leaderboardContainer: {
    gap: Spacing.md,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  medalContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalIcon: {
    fontSize: 28,
  },
  userContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  points: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  stat: {
    fontSize: 11,
    fontWeight: '500',
  },
});
