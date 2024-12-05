import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { FontAwesome6 } from '@expo/vector-icons';

interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  primaryColor?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  primaryColor = '#0c0c63',
  iconName = 'circle-exclamation',
  iconSize = 69,
  iconColor = primaryColor,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {iconName && <FontAwesome6 name={iconName} size={iconSize} color={iconColor} style={styles.icon} />}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: '20@s',
    backgroundColor: '#fff',
    borderRadius: '8@s',
    alignItems: 'center',
  },
  icon: {
    marginBottom: '10@s',
  },
  title: {
    fontSize: '18@s',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10@s',
  },
  message: {
    fontSize: '14@s',
    color: '#666',
    textAlign: 'center',
    marginBottom: '20@s',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: '10@s',
    borderRadius: '5@s',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: '10@s',
  },
  cancelText: {
    color: '#555',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
