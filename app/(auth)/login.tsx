import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import Container from '@/components/Container';
import { auth, db } from '@/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLogLevel } from 'firebase/app';

const Login = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  useEffect(() => {
    (async () => {
      const role = await AsyncStorage.getItem('role');
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        if (role === 'responder') {
          router.replace('/responder');
        } else {
          router.replace('/user');
        }
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Username and Password are required.');
      return;
    }
    try {
      const userRef = ref(db, 'users');
      const snapshot = await get(userRef);
      const users = snapshot.val();

      let userFound = false;
      let userEmail = '';
      let userRole = '';

      for (const userId in users) {
        if (users[userId].username === username) {
          userFound = true;
          userEmail = users[userId].email;
          userRole = users[userId].role;
          console.log(users[userId]);
          break;
        }
      }

      if (!userFound) {
        Alert.alert('Error', 'Username does not exist.');
        return;
      }

      // Sign in with Firebase Auth
      const user = await signInWithEmailAndPassword(auth, userEmail, password);
      await AsyncStorage.setItem('userId', user.user.uid);
      await AsyncStorage.setItem('user', JSON.stringify(user.user));
      await AsyncStorage.setItem('role', userRole);

      // Check user role and navigate accordingly
      if (userRole === 'responder') {
        router.replace('/responder/');
      } else if (userRole === 'admin') {
        router.replace('/admin/');
      } else {
        router.replace('/user');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
        setLogLevel('debug');
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (resetEmail.trim() === '') {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert('Success', 'Password reset link sent to your email.');
      setShowForgotPasswordModal(false); // Close the modal
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
        setLogLevel('debug');
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };
  // const handleLogin = () => {
  //   return router.push('/user');
  // };

  // const handleForgotPassword = () => {
  //   return;
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
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
            <Pressable onPress={() => setShowPassword((prev) => !prev)}>
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={25} color={'#5997C6'} />
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
          <Text style={styles.connectWith}>or connect with</Text>
          <View style={styles.thirdpartyButtonContainer}>
            <Icon name="facebook-square" size={40} color={'#0c0c63'} />
            <Icon name="user" size={40} color={'#0c0c63'} />
            <Icon name="google" size={40} color={'#0c0c63'} />
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
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf9f6',
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    rowGap: 5,
    paddingTop: 20,
  },
  logo: {
    resizeMode: 'center',
    width: 200,
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
    borderColor: 'black',
    borderWidth: 1,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#7481ae',
    fontSize: 16,
    fontWeight: 'semibold',
    paddingVertical: 2,
  },
  submit: {
    width: 160,
    marginHorizontal: 'auto',
    backgroundColor: '#0c0c63',
    marginTop: 15,
    padding: 15,
    borderRadius: 50,
  },
  submitText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#ffffff',
  },
  forgotPass: {
    textAlign: 'center',
    color: '#000000',
    marginVertical: 10,
    paddingVertical: 10,
    fontWeight: 'bold',
    textDecorationColor: '#000000',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  connectWith: {
    textAlign: 'center',
    paddingBottom: 20,
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
    marginBottom: 60,
  },
  normalRegisterText: {
    color: '#000000',
  },
  registerText: {
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
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
