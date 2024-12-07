import { Href, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const responderFooter = () => {
  const router = useRouter();
  const currentPath = usePathname();

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
          style={[styles.iconContainer, isActive('/responder') && styles.activeFooter]}
          onPress={() => handlePress('/responder')}
          disabled={currentPath === '/responder'}
        >
          <Icon name="home" size={40} color={isActive('/responder') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconContainer, isActive('/responder/contacts') && styles.activeFooter]}
          onPress={() => handlePress('/responder/contacts')}
          disabled={currentPath === '/responder/contacts'}
        >
          <Icon name="contacts" size={40} color={isActive('/responder/contacts') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>

        <View style={styles.halfCircleWrapper}>
          <View style={styles.halfCircle} />
          <Pressable style={styles.iconContainer} onPress={() => router.push('/responder/responderMap')}>
            <Image source={require('@/assets/images/nav_map.png')} style={styles.panicButton} />
          </Pressable>
        </View>
        <TouchableOpacity
          style={[styles.iconContainer, isActive('/responder/messages') && styles.activeFooter]}
          onPress={() => handlePress('/responder/messages')}
          disabled={currentPath === '/responder/messages'}
        >
          <Icon
            name="message-processing"
            size={40}
            color={isActive('/responder/messages') ? '#3998ff' : '#e6e6e6'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconContainer, isActive('/responder/profile') && styles.activeFooter]}
          onPress={() => handlePress('/responder/profile')}
          disabled={currentPath === '/responder/profile'}
        >
          <Icon name="account" size={40} color={isActive('/responder/profile') ? '#3998ff' : '#e6e6e6'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default responderFooter;

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
    resizeMode: 'contain',
    height: 60,
    width: 60,
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  halfCircleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfCircle: {
    position: 'absolute',
    top: -30,
    width: 75,
    height: 35,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
});
