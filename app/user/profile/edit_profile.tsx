import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { Octicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import HeaderText from '@/components/app/HeaderText';
import useUser from '@/hooks/useUser';
import Loading from '@/components/app/Loading';

export default function EditProfile() {
  const { user, loading } = useUser();

  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFname(user.firstname || '');
      setLname(user.lastname || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderText text="Edit Profile" />
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={30}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.imageContainer}>
              <View>
                <Image source={require('@/assets/images/profile.png')} style={styles.image} />
                <TouchableOpacity style={styles.editImageBtn}>
                  <Octicons name="upload" size={16} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.form}>
              <Text style={styles.formText}>First Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="First Name"
                value={fname}
                onChangeText={setFname}
              />
              <Text style={styles.formText}>Last Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Last Name"
                value={lname}
                onChangeText={setLname}
              />
              <Text style={styles.formText}>Email</Text>
              <TextInput style={styles.formInput} placeholder="Email" value={email} onChangeText={setEmail} />
              <Text style={styles.formText}>Username</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <Text style={styles.formText}>Password</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter new password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '30@s',
    backgroundColor: '#e6e6e6',
    gap: '10@s',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e3e1',
  },
  headerText: {
    fontSize: '20@s',
    fontFamily: 'BeVietnamProBold',
    color: '#0c0c63',
  },
  form: {
    paddingVertical: '10@s',
    paddingHorizontal: '30@s',
  },
  formText: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProMedium',
    color: '#0c0c63',
  },
  formInput: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#0c0c63',
    backgroundColor: '#e6e6e6',
    borderRadius: '10@s',
    marginBottom: '10@s',
    marginTop: '5@s',
    paddingHorizontal: '10@s',
    paddingVertical: '5@s',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30@s',
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
    width: '120@s',
    height: '120@s',
  },
  editImageBtn: {
    position: 'absolute',
    bottom: '5@s',
    right: '15@s',
    backgroundColor: '#FFF',
    width: '25@s',
    height: '25@s',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5@s',
  },
  saveButton: {
    backgroundColor: '#0c0c63',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10@s',
    borderRadius: '10@s',
    paddingVertical: '10@s',
    paddingHorizontal: '20@s',
    marginTop: '30@s',
  },
  buttonText: {
    color: '#FFF',
    fontSize: '16@s',
    fontFamily: 'BeVietnamProSemiBold',
  },
});
