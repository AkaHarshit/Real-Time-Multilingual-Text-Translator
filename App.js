import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TranslateApp from './src'; 

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <TranslateApp/>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

