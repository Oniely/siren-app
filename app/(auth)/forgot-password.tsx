import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
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
    // add code to reset password hered
    return;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.formContainer}>
          <Text style={styles.signupText}>FORGOT{'\n'}PASSWORD</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="current password"
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="password"
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="confirm password"
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

export default ForgotPassword;
