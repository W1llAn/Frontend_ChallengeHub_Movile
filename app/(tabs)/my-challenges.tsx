import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';


export default function MyChallengesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Retos</Text>
      <Text style={styles.subtitle}>Aquí verás tus retos activos y completados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
