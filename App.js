import { StyleSheet, View } from 'react-native';
import TranslateApp from './translate/src'; 

export default function App() {
  return (
    <View style={styles.container}>
      <TranslateApp/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

