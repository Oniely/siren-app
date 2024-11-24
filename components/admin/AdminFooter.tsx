import { Href, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CentralButtonPopup from '../CentralButtonPopup';

// THIS IS THE NAV FOOTER FOR ADMIN - CHANGE THE HREF's BELOW
const AdminFooter = () => {
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
          style={[styles.iconContainer, isActive('/admin') && styles.activeFooter]}
          onPress={() => handlePress('/admin')}
          disabled={currentPath === '/admin'}
        >
          <Icon name="home" size={40} color={isActive('/admin') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconContainer, isActive('/admin/emergency_report') && styles.activeFooter]}
          onPress={() => handlePress('/admin/emergency_report')}
          disabled={currentPath === '/admin/emergency_report'}
        >
          <Icon
            name="contacts"
            size={40}
            color={isActive('/admin/emergency_report') ? '#3998ff' : '#e6e6e6'}
          />
        </TouchableOpacity>

        <View style={styles.halfCircleWrapper}>
          <View style={styles.halfCircle} />
          <Pressable style={styles.iconContainer} onPress={() => setSirenClicked((prev) => !prev)}>
            <CentralButtonPopup isVisible={sirenClicked} onClose={() => setSirenClicked(false)} />
            <Image source={require('@/assets/images/footerSiren.png')} style={styles.panicButton} />
          </Pressable>
        </View>
        <TouchableOpacity
          style={[styles.iconContainer, isActive('/change_me_for_active_tab') && styles.activeFooter]}
          onPress={() => handlePress('/admin')}
          disabled={currentPath === '/admin'}
        >
          <Icon name="message-processing" size={40} color={isActive('/messages') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconContainer, isActive('/change_me_for_active_tab') && styles.activeFooter]}
          onPress={() => handlePress('/admin')}
          disabled={currentPath === '/admin'}
        >
          <Icon name="account" size={40} color={isActive('/profile') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AdminFooter;

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
    gap: 0, // original value = 15
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
