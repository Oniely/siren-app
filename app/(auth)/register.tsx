import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig.js';
import { useState } from 'react';
import React, {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);

      if (response.user) {
        alert('Account created successfully');
        router.push('/login');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.formContainer}>
          <Text style={styles.signupText}>SIGN UP</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="username"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput placeholder="email" style={styles.input} value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="confirm password"
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
});

export default Register;
