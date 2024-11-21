import { Href, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
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
  const isActive = (path: string) => currentPath === path;

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={[styles.iconContainer, isActive('/') && styles.activeFooter]}
          onPress={() => handlePress('/')}
          disabled={currentPath === '/'}
        >
          <Icon name="home" size={40} color={isActive('/') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconContainer, isActive('/contacts') && styles.activeFooter]}
          onPress={() => handlePress('/contacts')}
          disabled={currentPath === '/contacts'}
        >
          <Icon name="contacts" size={40} color={isActive('/contacts') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <View style={styles.halfCircleWrapper}>
          <View style={styles.halfCircle} />
          <Pressable style={styles.iconContainer} onPress={() => setSirenClicked((prev) => !prev)}>
            <CentralButtonPopup isVisible={sirenClicked} onClose={() => setSirenClicked(false)} />
            <Image source={require('@/assets/images/footerSiren.png')} style={styles.panicButton} />
          </Pressable>
        </View>
        <TouchableOpacity
          style={[styles.iconContainer, isActive('/messages') && styles.activeFooter]}
          onPress={() => handlePress('/messages')}
          disabled={currentPath === '/messages'}
        >
          <Icon name="message-processing" size={40} color={isActive('/messages') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconContainer, isActive('/profile') && styles.activeFooter]}
          onPress={() => handlePress('/profile')}
          disabled={currentPath === '/profile'}
        >
          <Icon name="account" size={40} color={isActive('/profile') ? '#3998ff' : '#e6e6e6'} />
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
<<<<<<< HEAD
=======
    gap: 0, // original value = 15
>>>>>>> 68a3b1888f54cc610f7afec68981598322449599
    padding: 15,
    zIndex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: 80,
    position: 'relative',
  },
  activeFooter: {
    borderTopColor: '#3998ff',
    borderTopWidth: 4,
    paddingTop: 4,
  },
  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
  },
  halfCircleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfCircle: {
    position: 'absolute',
    top: -45, 
    width: 80,
    height: 35, 
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40,
  },
});
