import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from './ThemedView';

interface Props {
  children: React.ReactNode;
  bg?: string;
  statusBarStyle?: 'auto' | 'inverted' | 'light' | 'dark';
  style?: ViewStyle;
}

const Container = ({ children, bg = '#FFF', statusBarStyle = 'auto', style }: Props) => {
  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: bg,
        },
        style,
      ]}
    >
      {children}
      <StatusBar style={statusBarStyle} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  // safeArea: {
  //   flex: 1,
  // },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
});

export default Container;
