import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const Login = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = () => {
    return router.push('/(tabs)/');
  };

  const handleForgotPassword = () => {
    return;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('@/assets/images/siren_icon.png')} style={styles.logo} />
        <Image source={require('@/assets/images/siren_text.png')} style={[styles.logo, styles.logoText]} />
      </View>

      <View style={styles.formContainer}>
        <View>
          <View style={styles.whiteLine} />
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#0c0c63" />
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#0c0c63" />
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(prev => !prev)}>
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={30} color={'#5997C6'} />
            </Pressable>
          </View>
          <TouchableOpacity style={styles.submit} onPress={handleLogin}>
            <Text style={styles.submitText}>Login</Text>
          </TouchableOpacity>
          <Pressable onPress={() => setShowForgotPasswordModal(true)}>
            <Text style={styles.forgotPass}>Forgot Password?</Text>
          </Pressable>
        </View>
        <View>
          <Text style={styles.forgotPass}>or connect with</Text>
          <View style={styles.thirdpartyButtonContainer}>
            <Icon name="facebook-square" size={40} color={'#77c4d3'} />
            <Icon name="user" size={40} color={'#77c4d3'} />
            <Icon name="google" size={40} color={'#77c4d3'} />
          </View>
          <View style={styles.askToRegister}>
            <Text style={styles.normalRegisterText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>Signup</Text>
            </Pressable>
          </View>
        </View>
      </View>
      {/* Forgot Password Modal */}
      <Modal transparent={true} visible={showForgotPasswordModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.modalInput}
              value={resetEmail}
              onChangeText={setResetEmail}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleForgotPassword}>
              <Text style={styles.modalButtonText}>Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForgotPasswordModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c63',
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    rowGap: 25,
    paddingTop: 20,
  },
  logo: {
    resizeMode: 'stretch',
    width: 160,
    height: '70%',
  },
  logoText: {
    height: '25%',
  },
  whiteLine: {
    borderTopWidth: 2,
    borderColor: '#fff',
    width: '45%',
    marginHorizontal: 'auto',
    marginBottom: 20,
  },
  formContainer: {
    flex: 2,
    position: 'relative',
    width: '100%',
    marginTop: 80,
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    width: '70%',
    backgroundColor: '#fff',
    marginHorizontal: 'auto',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 30,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#7481ae',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  submit: {
    width: 160,
    marginHorizontal: 'auto',
    backgroundColor: '#93E0EF',
    marginTop: 15,
    padding: 15,
    borderRadius: 50,
  },
  submitText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C0C63',
  },
  forgotPass: {
    textAlign: 'center',
    color: '#fff',
    marginVertical: 10,
  },
  thirdpartyButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 10,
  },
  askToRegister: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  normalRegisterText: {
    color: 'white',
  },
  registerText: {
    fontWeight: 'bold',
    color: '#93E0EF',
  },

  // Forgot Password Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#93E0EF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#0C0C63',
    fontWeight: 'bold',
  },
  modalCloseText: {
    color: '#007BFF',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default Login;
