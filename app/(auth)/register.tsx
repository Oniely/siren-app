import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig.js';
import { useEffect, useState } from 'react';
import React, {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, set, get } from 'firebase/database';

const Register = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const role = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          if (role === 'responder') {
            router.replace('/(tabs)/responder');
          } else {
            router.replace('/(tabs)/admin');
          }
        }
      } catch (error) {
        console.error('Error retrieving AsyncStorage data:', error);
      }
    })();
  }, []);
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }

    try {
      const userRef = ref(db, 'users');
      const snapshot = await get(userRef);
      const existingUsers = snapshot.val();

      for (const userId in existingUsers) {
        if (existingUsers[userId].username === username) {
          Alert.alert('Error', 'Username already exists.');
          return;
        }
        if (existingUsers[userId].email === email) {
          Alert.alert('Error', 'Email already exists.');
          return;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      Alert.alert('Responder', 'Are you a responder?', [
        {
          text: 'Yes',
          onPress: async () => {
            await set(ref(db, `users/${userId}`), {
              username,
              email,
              role: 'responder',
            });
            router.navigate('/(auth)/login');
          },
        },
        {
          text: 'No',
          onPress: async () => {
            await set(ref(db, `users/${userId}`), {
              username,
              email,
              role: 'user',
            });
            router.navigate('/(auth)/login');
          },
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.signupText}>SIGN UP</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="i.e john@gmail.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Create a strong password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Re-type password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.signup} onPress={handleSignup}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
          <View style={styles.hasAccount}>
            <Text style={styles.hasAccountQuestion}>Already have an account?</Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>LOGIN</Text>
            </Pressable>
          </View>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
    position: 'relative',
    textAlign: 'center',
    justifyContent: 'center',
    display: 'flex',
  },

  signupText: {
    color: '#0c0c63',
    fontSize: 60,
    fontFamily: 'DMSansBold',
    fontWeight: 'bold',
    textAlign: 'left',
    marginLeft: 50,
    marginBottom: 50,
  },
  inputContainer: {
    width: '80%',
    marginHorizontal: 'auto',
    gap: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#0C0C63',
    paddingLeft: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#0C0C63',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    paddingVertical: 10,
  },
  signup: {
    width: '80%',
    marginHorizontal: 'auto',
    backgroundColor: '#0c0c63',
    padding: 10,
    borderRadius: 30,
    marginVertical: 20,
  },
  createAccountText: {
    color: '#ffffff',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 20,
  },
  hasAccount: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 15,
  },
  hasAccountQuestion: {
    color: '#000000',
    fontSize: 18,
  },
  loginLink: {
    fontWeight: 'bold',
    fontSize: 18,
    textDecorationColor: '#000000',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    color: '#000000',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: '#1010',
  },
});

export default Register;
