import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
  message?: string;
}

const LoadingOverlay = ({ visible, message = 'Loading...' }: Props) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade" hardwareAccelerated={true}>
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    width: 200,
    height: 100,
  },
  message: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'BeVietnamProMedium',
  },
});

export default LoadingOverlay;
