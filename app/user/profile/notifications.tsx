import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import NotificationCard from '@/components/NotificationCard';

export default function EditProfile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} color="#0c0c63" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Notifications</Text>
          <Text style={styles.notifText}>
            You have <Text style={styles.notifColor}>2 notification</Text> today.
          </Text>
        </View>
      </View>
      <View style={styles.notifications}>
        <Text style={styles.timeHeaderText}>Today</Text>
        {/* use this component to render notifs */}
        <NotificationCard
          href={'/'}
          image={require('@/assets/images/profile.png')}
          name="Lorem Ipsum"
          desc="Lorem Ipsum dolor sit amet, consec..."
          time="12:01AM"
          read
        />
        <Text style={styles.timeHeaderText}>This week</Text>
        {/* use this component to render notifs */}
        <NotificationCard
          href={'/'}
          image={require('@/assets/images/profile.png')}
          name="Lorem Ipsum"
          desc="Lorem Ipsum dolor sit amet, consec..."
          time="12:01AM"
          read
        />
        <NotificationCard
          href={'/'}
          image={require('@/assets/images/profile.png')}
          name="Lorem Ipsum"
          desc="Lorem Ipsum dolor sit amet, consec..."
          time="12:01AM"
          read
        />
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
    padding: '25@s',
    backgroundColor: '#e6e6e6',
    gap: '5@s',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdb',
  },
  headerTextContainer: {
    position: 'relative',
    flex: 1,
  },
  headerText: {
    fontSize: '22@s',
    fontFamily: 'BeVietnamProBold',
    color: '#0c0c63',
    marginBottom: 4,
  },
  notifText: {
    position: 'absolute',
    fontSize: '12@s',
    bottom: '-14@s',
    width: '100%',
    fontFamily: 'BeVietnamProRegular',
    color: '#b0adad',
  },
  notifColor: {
    color: '#087bb8',
    fontFamily: 'BeVietnamProMedium',
  },
  notifications: {
    paddingHorizontal: '25@s',
    paddingVertical: '10@s',
  },
  timeHeaderText: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProSemiBold',
    marginTop: '20@s',
  },
});
