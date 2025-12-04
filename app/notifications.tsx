import React, { useMemo, memo } from 'react';
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from '../components/Themed';
import { useColorScheme } from '../components/useColorScheme';
import Colors, { Shadows, Spacing, BorderRadius } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationsContext } from '../contexts/NotificationsContext';
import { NotificationItem } from '../components/UI/NotificationItem';

/**
 * Header Component
 */
const NotificationHeader = memo(({
  unreadCount,
  markingAllAsRead,
  onMarkAllAsRead,
  colors
}: {
  unreadCount: number;
  markingAllAsRead: boolean;
  onMarkAllAsRead: () => void;
  colors: typeof Colors.light;
}) => {
  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.headerTop}>
        <View style={[styles.iconBadge, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="notifications" size={28} color={colors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notificaciones
          </Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {unreadCount} sin leer
            </Text>
          )}
        </View>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={onMarkAllAsRead}
          disabled={markingAllAsRead}
          style={[
            styles.markAllButton,
            { 
              backgroundColor: colors.primary,
              opacity: markingAllAsRead ? 0.6 : 1
            }
          ]}
          activeOpacity={0.7}
        >
          {markingAllAsRead ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.markAllButtonText}>Marcando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-done" size={18} color="#ffffff" />
              <Text style={styles.markAllButtonText}>Marcar todas como leídas</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

NotificationHeader.displayName = 'NotificationHeader';

/**
 * Stats Card Component
 */
const StatsCard = memo(({
  total,
  unread,
  read,
  colors
}: {
  total: number;
  unread: number;
  read: number;
  colors: typeof Colors.light;
}) => {
  return (
    <View 
      style={[
        styles.statsCard,
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Shadows.medium
      ]}
    >
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {total}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {unread}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Sin leer
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {read}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Leídas
          </Text>
        </View>
      </View>
    </View>
  );
});

StatsCard.displayName = 'StatsCard';

/**
 * Empty State Component
 */
const EmptyState = memo(({ colors }: { colors: typeof Colors.light }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name="notifications-off-outline" size={64} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Todo al día
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        No tienes notificaciones nuevas en este momento
      </Text>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

/**
 * Main Screen Component
 */
export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const { user, completeUser } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    markingAsRead,
    markingAllAsRead,
    refreshNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead
  } = useNotificationsContext();

  console.log('[NotificationsScreen] 📱 Rendered with:', {
    userId: completeUser?.id,
    notificationsCount: notifications.length,
    unreadCount,
    loading,
    refreshing
  });
  console.log('[NotificationsScreen] 📋 Notifications:', notifications);

  // Separate notifications into unread and read
  const { unreadNotifications, readNotifications } = useMemo(() => {
    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read);
    return { unreadNotifications: unread, readNotifications: read };
  }, [notifications]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Notificaciones',
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando notificaciones...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notificaciones',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Header */}
      <NotificationHeader
        unreadCount={unreadNotifications.length}
        markingAllAsRead={markingAllAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        colors={colors}
      />

      {/* Content */}
      {notifications.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshNotifications}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <EmptyState colors={colors} />
        </ScrollView>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshNotifications}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onMarkAsRead={handleMarkAsRead}
              isMarking={markingAsRead === item.id}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View style={{ height: 140 }} />}
        />
      )}

      {/* Floating Stats Card */}
      {notifications.length > 0 && (
        <StatsCard
          total={notifications.length}
          unread={unreadCount}
          read={readNotifications.length}
          colors={colors}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
  },
  markAllButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyScrollContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  statsCard: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 44,
  },
});
