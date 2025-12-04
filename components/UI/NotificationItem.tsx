import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '../useColorScheme';
import Colors, { Shadows, Spacing, BorderRadius } from '../../constants/Colors';
import type { NotificationDTO } from '../../types/api/notification.type';
import { getNotificationIcon, getNotificationColor, formatTimeAgo } from '../../services/notification.service';

interface NotificationItemProps {
  notification: NotificationDTO;
  onMarkAsRead: (id: number) => void;
  isMarking: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isMarking
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const iconName = getNotificationIcon(notification.type) as keyof typeof Ionicons.glyphMap;
  const iconColor = getNotificationColor(notification.type);

  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        }
      ]}
    >
      <View 
        style={[
          styles.container,
          {
            backgroundColor: notification.read ? colors.surface : colors.primary + '08',
            borderColor: notification.read ? colors.border : colors.primary + '25',
            borderLeftColor: notification.read ? colors.border : iconColor,
          },
          notification.read ? Shadows.small : Shadows.medium
        ]}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View 
            style={[
              styles.iconContainer,
              { 
                backgroundColor: iconColor + '15',
                borderColor: iconColor + '30',
              }
            ]}
          >
            <Ionicons 
              name={iconName} 
              size={22} 
              color={iconColor}
            />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
          {/* Title and indicator */}
          <View style={styles.titleRow}>
            {!notification.read && (
              <View 
                style={[styles.indicator, { backgroundColor: iconColor }]}
              />
            )}
            <Text 
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontWeight: notification.read ? '600' : 'bold',
                }
              ]}
              numberOfLines={1}
            >
              {notification.title || 'Notificación'}
            </Text>
          </View>

          {/* Message */}
          <Text 
            style={[
              styles.message,
              {
                color: colors.textSecondary,
                opacity: notification.read ? 0.7 : 1,
              }
            ]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Time */}
            <View style={styles.timeContainer}>
              <Ionicons 
                name="time-outline" 
                size={12} 
                color={colors.textSecondary}
                style={{ opacity: 0.6 }}
              />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {formatTimeAgo(notification.createdAt)}
              </Text>
            </View>

            {/* Mark as read button */}
            {!notification.read && (
              <TouchableOpacity
                onPress={() => onMarkAsRead(notification.id)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isMarking}
                style={[
                  styles.markButton,
                  {
                    backgroundColor: colors.primary + '12',
                    borderColor: colors.primary + '30',
                    opacity: isMarking ? 0.6 : 1,
                  }
                ]}
                activeOpacity={0.7}
              >
                {isMarking ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={14} color={colors.primary} />
                    <Text style={[styles.markButtonText, { color: colors.primary }]}>
                      Marcar leída
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
        </View>
      </View>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  markButtonText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});

