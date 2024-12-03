import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRouter } from 'expo-router';

export default function Reports() {
  // use router to go to view report: router.push()
  const router = useRouter();

  return (
    <AdminStyledContainer>
      <AdminHeader />
      <View style={styles.header}>
        <Text style={styles.headerText}>Emergency Reports</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.reportsContainer}>
          <TouchableOpacity
            style={styles.report}
            onPress={() => router.push('/admin/emergency_report/report_detail')}
          >
            <Image source={require('@/assets/images/profile.png')} style={styles.reportImage} />
            <View style={styles.reportDesc}>
              <Text style={styles.descTime}>12:01AM</Text>
              <Text style={styles.descName}>Lorem Ipsum</Text>
              <Text numberOfLines={1} style={styles.descMessage}>
                Lorem ipsum dolor sit amet consectetur
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.report}
            onPress={() => router.push('/admin/emergency_report/report_detail')}
          >
            <Image source={require('@/assets/images/profile.png')} style={styles.reportImage} />
            <View style={styles.reportDesc}>
              <Text style={styles.descTime}>12:01AM</Text>
              <Text style={styles.descName}>Lorem Ipsum</Text>
              <Text numberOfLines={1} style={styles.descMessage}>
                Lorem ipsum dolor sit amet consectetur
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </AdminStyledContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#faf9f6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e6e6e6',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'BeVietnamProBold',
  },
  reportsContainer: {
    borderTopWidth: 2,
    borderTopColor: '#dfdedd',
  },
  report: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#dfdedd',
  },
  reportImage: {
    resizeMode: 'cover',
    width: 60,
    height: 60,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#343434',
  },
  reportDesc: {
    flex: 1,
  },
  descTime: {
    fontSize: 12,
    fontFamily: 'BeVietnamProRegular',
  },
  descName: {
    fontSize: 16,
    fontFamily: 'BeVietnamProBold',
  },
  descMessage: {
    fontSize: 14,
    fontFamily: 'BeVietnamProRegular',
    width: '95%',
  },
});
