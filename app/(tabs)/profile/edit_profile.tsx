import { View, Text, Image, TouchableOpacity, Pressable, TextInput } from 'react-native';
import React, { useState } from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} color="#0c0c63" />
        </Pressable>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>
      <View>
        <View style={styles.imageContainer}>
          <View>
            <Image source={require('@/assets/images/profile.png')} style={styles.image} />
            <TouchableOpacity style={styles.editImageBtn}>
              <Octicons name="upload" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.form}>
          <Text style={styles.formText}>Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Elizabeth Bracken"
            value={name}
            onChangeText={setName}
            secureTextEntry
          />
          <Text style={styles.formText}>Email</Text>
          <TextInput
            style={styles.formInput}
            placeholder="@elizabethbracken.php"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.formText}>Username</Text>
          <TextInput
            style={styles.formInput}
            placeholder="elizabeth69"
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
