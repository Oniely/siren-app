import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRouter } from 'expo-router';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';

export default function Reports() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Fetch all reports
        const reportsRef = ref(db, 'reports');
        const reportsSnapshot = await get(reportsRef);

        if (reportsSnapshot.exists()) {
          const reportsData = reportsSnapshot.val();
          const reportsArray: any[] = [];

          for (const key in reportsData) {
            const report = reportsData[key];
            const { senderId } = report;

            // Fetch reporter details using senderId
            const userRef = ref(db, `users/${senderId}`);
            const userSnapshot = await get(userRef);

            const reporter = userSnapshot.exists() ? userSnapshot.val() : null;

            // Combine report and reporter details
            reportsArray.push({
              ...report,
              reporterName: reporter?.firstname + ' ' + reporter?.lastname || 'Unknown',
              reporterProfile: reporter?.profilePicture || null,
            });
          }

          setReports(reportsArray);
        } else {
          console.log('No reports found');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  return (
    <AdminStyledContainer>
      <AdminHeader />
      <View style={styles.header}>
        <Text style={styles.headerText}>Emergency Reports</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.reportsContainer}>
          {reports.map((report, index) => (
            <TouchableOpacity
              key={index}
              style={styles.report}
              onPress={() => router.navigate(`/admin/emergency_report/report_detail?id=${report.reportId}`)}
            >
              <Image
                source={
                  report?.reporterProfile
                    ? { uri: report.reporterProfile }
                    : require('@/assets/images/profile.png')
                }
                style={styles.reportImage}
              />
              <View style={styles.reportDesc}>
                <Text style={styles.descTime}>{report.time}</Text>
                <Text style={styles.descName}>{report.reporterName}</Text>
                <Text numberOfLines={1} style={styles.descMessage}>
                  {report.details}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
