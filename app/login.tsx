import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors, {
  BorderRadius,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function LoginScreen() {
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const colors = Colors[colorScheme];
  const { login, user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  // Animaciones
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Redirigir si ya está autenticado
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: "transparent" }]}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="trophy" size={60} color={colors.textInverse} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            ChallengeHub
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Desafía, compite y gana
          </Text>
        </View>

        {/* Features Section */}
        <View
          style={[styles.featuresContainer, { backgroundColor: "transparent" }]}
        >
          <FeatureCard
            icon="ribbon"
            title="Retos Emocionantes"
            description="Participa en desafíos diarios y compite con usuarios de todo el mundo"
            colors={colors}
          />

          <FeatureCard
            icon="medal"
            title="Gana Medallas"
            description="Desbloquea logros exclusivos y colecciona medallas únicas"
            colors={colors}
          />

          <FeatureCard
            icon="gift"
            title="Bonificaciones"
            description="Obtén recompensas increíbles por tus victorias y progreso"
            colors={colors}
          />
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, { backgroundColor: "transparent" }]}>
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: colors.primary },
              pressed && styles.loginButtonPressed,
            ]}
            onPress={handleLogin}
          >
            <Ionicons
              name="log-in-outline"
              size={24}
              color={colors.textInverse}
            />
            <Text
              style={[styles.loginButtonText, { color: colors.textInverse }]}
            >
              Iniciar Sesión
            </Text>
          </Pressable>

          <Text
            style={[styles.loginDescription, { color: colors.textTertiary }]}
          >
            Usa Auth0 para acceder de forma segura
          </Text>
        </View>

        {/* Stats Section */}
        <View
          style={[styles.statsContainer, { backgroundColor: "transparent" }]}
        >
          <StatItem value="10K+" label="Usuarios activos" colors={colors} />
          <StatItem value="50+" label="Retos disponibles" colors={colors} />
          <StatItem value="1M+" label="Medallas ganadas" colors={colors} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

// Componente de característica
interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: typeof Colors.light;
}

function FeatureCard({ icon, title, description, colors }: FeatureCardProps) {
  return (
    <View
      style={[
        styles.featureCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Shadows.small,
      ]}
    >
      <View
        style={[
          styles.featureIconContainer,
          { backgroundColor: colors.primaryLight + "20" },
        ]}
      >
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.featureDescription, { color: colors.textSecondary }]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

// Componente de estadística
interface StatItemProps {
  value: string;
  label: string;
  colors: typeof Colors.light;
}

function StatItem({ value, label, colors }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    minHeight: "100%",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: Spacing.sm,
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  featuresContainer: {
    width: "100%",
    maxWidth: 600,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureTextContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaSection: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    width: "100%",
    maxWidth: 300,
    gap: Spacing.sm,
  },
  loginButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginDescription: {
    fontSize: 12,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 500,
    paddingTop: Spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});
