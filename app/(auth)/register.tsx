import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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
import { Picker } from '@react-native-picker/picker';

const Register = () => {
  const router = useRouter();

  const [category, setCategory] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const role = await AsyncStorage.getItem('role');
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          if (role === 'responder') {
            router.replace('/responder');
          } else {
            router.replace('/admin');
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

      await updateProfile(auth?.currentUser!, {
        displayName: `${firstname} ${lastname}`,
      });

      if (category === 'User') {
        await set(ref(db, `users/${userId}`), {
          firstname,
          lastname,
          username,
          email,
          number,
          role: 'user',
        });
      } else if (category === 'Responder') {
        await set(ref(db, `users/${userId}`), {
          firstname,
          lastname,
          username,
          email,
          number,
          role: 'responder',
        });

        await set(ref(db, `responders/${userId}`), {
          status: 'inactive',
          location: null, // Add a default value for location if needed
        });
      }

      Alert.alert('Success', 'Account created successfully!');
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.formContainer}>
          <Text style={styles.signupText}>SIGN UP</Text>
          <View style={styles.inputContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue: string) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="User" value="User" style={styles.pickerText} />
              <Picker.Item label="Responder" value="Responder" style={styles.pickerText} />
            </Picker>
            <TextInput
              placeholder="firstname"
              style={styles.input}
              value={firstname}
              onChangeText={setFirstname}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="lastname"
              style={styles.input}
              value={lastname}
              onChangeText={setLastname}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="username"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="number"
              style={styles.input}
              value={number}
              onChangeText={setNumber}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="confirm password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    fontFamily: 'BeVietnamProBold',
    alignSelf: 'flex-start',
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
    fontFamily: 'BeVietnamProRegular',
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
    fontSize: 16,
    fontFamily: 'BeVietnamProRegular',
  },
  loginLink: {
    fontSize: 16,
    textDecorationColor: '#000000',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    color: '#000000',
    fontFamily: 'BeVietnamProMedium',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: '#1010',
  },
  picker: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#0C0C63',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    paddingVertical: 10,
    fontFamily: 'BeVietnamProRegular',
  },
  pickerText: {
    fontFamily: 'BeVietnamProRegular',
  },
});

export default Register;
