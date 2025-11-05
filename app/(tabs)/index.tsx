import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';

/**
 * Home Screen - Main feed showing featured challenges and categories
 * Follows Single Responsibility Principle: manages only home feed display
 */
export default function HomeScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.greeting}>¡Hola, User! ¿Listo para un nuevo reto?</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destacados para ti</Text>
          <Text style={styles.placeholder}>Carrusel de retos destacados</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <Text style={styles.placeholder}>Fitness • Arte • Cocina • Viajes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explorar Retos</Text>
          <Text style={styles.placeholder}>Grid de retos disponibles</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
    marginTop: 24,
    marginBottom: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: -0.015,
  },
  placeholder: {
    fontSize: 16,
    opacity: 0.6,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});
