import { Href, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CentralButtonPopup from './CentralButtonPopup';

const Footer = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const [sirenClicked, setSirenClicked] = useState(false);

  const handlePress = (path: Href) => {
    if (currentPath !== path) {
      router.push(path);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity style={styles.icon} onPress={() => handlePress('/')} disabled={currentPath === '/'}>
          <Icon name="home" size={30} color={'#0C0C63'} />
          <Text style={styles.iconText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => handlePress('/contacts')}
          disabled={currentPath === '/contacts'}
        >
          <Icon name="contacts" size={30} color={'#0C0C63'} />
          <Text style={styles.iconText}>Contacts</Text>
        </TouchableOpacity>

        <Pressable style={styles.icon} onPress={() => setSirenClicked((prev) => !prev)}>
          <CentralButtonPopup isVisible={sirenClicked} onClose={() => setSirenClicked(false)} />
          <Icon name="bell-ring" size={30} color={'#0C0C63'} />
          <Text style={[styles.iconText, { fontWeight: 'bold' }]}>SIREN</Text>
        </Pressable>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => handlePress('/messages')}
          disabled={currentPath === '/messages'}
        >
          <Icon name="message-processing" size={30} color={'#0C0C63'} />
          <Text style={styles.iconText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => handlePress('/profile')}
          disabled={currentPath === '/profile'}
        >
          <Icon name="account" size={30} color={'#0C0C63'} />
          <Text style={styles.iconText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginHorizontal: 'auto',
    position: 'relative',
    zIndex: 1,
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    zIndex: 1,
    backgroundColor: '#ffffff',
  },
  icon: {
    alignItems: 'center',
    gap: 5,
    height: 60,
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingHorizontal: 10,
    width: 80,
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0C0C63',
  },
});
