import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scale, ScaledSheet } from 'react-native-size-matters';

interface Props {
  text?: string;
  bg?: string;
}

export default function HeaderText({ text = 'Your Header', bg = '#e6e6e6' }: Props) {
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: bg }]}>
      {/* <Burger /> */}
      <Pressable onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={scale(32)} color="#0c0c63" />
      </Pressable>
      <Text style={styles.headerText}>{text}</Text>
    </View>
  );
}

const styles = ScaledSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '25@s',
    gap: '5@s',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdb',
  },
  headerText: {
    fontSize: '22@s',
    fontFamily: 'BeVietnamProBold',
    color: '#0c0c63',
    marginBottom: 4,
  },
});
