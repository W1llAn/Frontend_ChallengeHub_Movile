import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';


export default function CreatorsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creadores</Text>
      <Text style={styles.subtitle}>Descubre creadores de retos increíbles</Text>
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
