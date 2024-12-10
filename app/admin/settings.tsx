import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ScaledSheet } from 'react-native-size-matters';
import HeaderText from '@/components/app/HeaderText';
import { FontAwesome6 } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <HeaderText text="Settings" />
      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.settingHeader}>Emergency Preparedness</Text>
        <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/admin/notifications')}>
          <View style={styles.settingContent}>
            <MaterialCommunityIcons name="bell" size={24} color="#b6b6b7" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/admin/map')}>
          <View style={styles.settingContent}>
            <MaterialCommunityIcons name="map-outline" size={24} color="#b6b6b7" />
            <Text style={styles.settingText}>Map</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
        </TouchableOpacity>
        <Text style={styles.settingHeader}>Notifications</Text>
        <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/admin/notifications')}>
          <View style={styles.settingContent}>
            <MaterialCommunityIcons name="bell" size={24} color="#b6b6b7" />
            <Text style={styles.settingText}>Notification Management</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
        </TouchableOpacity>
        <Text style={styles.settingHeader}>Location</Text>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => router.push('/admin/map')}
          activeOpacity={0.8}
        >
          <View style={styles.settingContent}>
            <FontAwesome6 name="location-dot" size={24} color="#b6b6b7" />
            <Text style={styles.settingText}>Location</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#b6b6b7" />
        </TouchableOpacity>

        <Text style={[styles.settingHeader, { marginTop: 25 }]}>Support</Text>
        <Text style={styles.settingText}>Contact Support</Text>
        <Text style={styles.settingText}>Report a Bug</Text>
        <Text style={styles.settingText}>Feedback</Text>
        <Text style={styles.settingHeader}>About</Text>
        <Text style={styles.settingText}>Version 1.0.0</Text>
        <Text style={styles.settingText}>Developed by: cognito.</Text>
      </ScrollView>
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
    paddingVertical: '15@s',
    paddingHorizontal: '20@s',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    gap: 5,
  },
  headerText: {
    fontSize: '20@s',
    color: '#0c0c63',
    fontFamily: 'BeVietnamProSemiBold',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: '20@s',
  },
  settingHeader: {
    fontSize: '18@s',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#343434',
    marginTop: '20@s',
  },
  settingButton: {
    paddingVertical: '10@s',
    paddingHorizontal: '20@s',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingText: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#b6b6b7',
  },
});
