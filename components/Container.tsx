import { StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  bg?: string;
  statusBarStyle?: 'auto' | 'inverted' | 'light' | 'dark';
}

const Container = ({ children, bg = '#FFF', statusBarStyle = 'auto' }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView
        style={[
          styles.container,
          {
            backgroundColor: bg,
          },
        ]}>
        {children}
        <StatusBar style={statusBarStyle} />
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});

export default Container;
