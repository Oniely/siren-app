import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function CentralButtonPopup({ isVisible, onClose }: Props) {
  const router = useRouter();
  const popupScale = new Animated.Value(0);

  useEffect(() => {
    if (isVisible) {
      Animated.spring(popupScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(popupScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.popupContainer, { transform: [{ scale: popupScale }] }]}>
      <Svg height="200" width="400" style={styles.semiCircle}>
        <Defs>
          <LinearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF0000" />
            <Stop offset="20%" stopColor="#FF7F00" />
            <Stop offset="40%" stopColor="#FFFF00" />
            <Stop offset="60%" stopColor="#00FF00" />
            <Stop offset="80%" stopColor="#0000FF" />
            <Stop offset="100%" stopColor="#4B0082" />
          </LinearGradient>
        </Defs>
        <Path d="M 200 200 A 150 150 0 0 1 0 200 L 0 200 L 200 200 Z" fill="url(#rainbowGradient)" />
        <Path d="M 180 200 A 130 130 0 0 1 20 200 L 20 200 L 180 200 Z" fill="#5997c6" />
      </Svg>

      <View style={[styles.iconContainer, { top: 75, left: 30 }]}>
        <TouchableOpacity
          onPress={() => {
            router.push('/');
            onClose();
          }}
        >
          <FontAwesome6 name="handshake-angle" size={40} color="#0c0c63" />
        </TouchableOpacity>
      </View>

      <View style={[styles.iconContainer, { top: 20, left: 65 }]}>
        <TouchableOpacity
          onPress={() => {
            router.push('/');
            onClose();
          }}
        >
          <FontAwesome5 name="graduation-cap" size={40} color="#0c0c63" />
        </TouchableOpacity>
      </View>

      <View style={[styles.iconContainer, { top: 20, right: 65 }]}>
        <TouchableOpacity
          onPress={() => {
            router.push('/map');
            onClose();
          }}
        >
          <FontAwesome5 name="map-marked-alt" size={40} color="#0c0c63" />
        </TouchableOpacity>
      </View>

      <View style={[styles.iconContainer, { top: 75, right: 30 }]}>
        <TouchableOpacity
          onPress={() => {
            router.push('/');
            onClose();
          }}
        >
          <Ionicons name="settings" size={40} color="#0c0c63" />
        </TouchableOpacity>
      </View>

      <View style={styles.innerCircle} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popupContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    width: 250,
    height: 130,
    backgroundColor: '#5997c6',
    borderTopLeftRadius: 125,
    borderTopRightRadius: 125,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semiCircle: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupText: {
    fontSize: 12,
    color: '#0c0c63',
    marginTop: 4,
  },
  innerCircle: {
    position: 'absolute',
    bottom: 0,
    width: 60,
    height: 50,
    backgroundColor: '#d7f1f7',
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
  },
});
