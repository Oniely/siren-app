import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPassword = () => {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleResetPassword = () => {
    return;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        <Image source={require('@/assets/images/top_image.png')} />
        <View style={styles.formContainer}>
          <Text style={styles.signupText}>Forgot Password</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="i.e john@gmail.com"
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Create a strong password"
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              placeholder="Re-type password"
              style={styles.input}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity style={styles.signup} onPress={handleResetPassword}>
            <Text style={styles.createAccountText}>Reset Password</Text>
          </TouchableOpacity>
          <View style={styles.hasAccount}>
            <Text style={styles.hasAccountQuestion}>Already have an account?</Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Log in</Text>
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
    backgroundColor: '#d7f1f7',
    position: 'relative',
  },
  topImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  signupText: {
    color: '#0B0C63',
    fontSize: 60,
    fontWeight: 'bold',
    textShadowRadius: 5,
    textShadowColor: '#0B0C63',
    paddingLeft: 20,
    marginBottom: 50,
  },
  inputContainer: {
    width: '80%',
    marginHorizontal: 'auto',
    gap: 5,
    marginBottom: 15,
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
    paddingVertical: 5,
    backgroundColor: '#AFE8F3',
  },
  signup: {
    width: '80%',
    marginHorizontal: 'auto',
    backgroundColor: '#0B0C63',
    padding: 10,
    borderRadius: 30,
    marginVertical: 20,
  },
  createAccountText: {
    color: '#AFE8F3',
    textAlign: 'center',
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
    color: '#0C0C63',
    fontSize: 18,
  },
  loginLink: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0C0C63',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    backgroundColor: '#1010',
  },
});

export default ForgotPassword;
