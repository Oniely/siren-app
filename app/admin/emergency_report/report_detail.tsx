import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRouter } from 'expo-router';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import MapView, { Marker } from 'react-native-maps';

export default function ReportDetail() {
  const router = useRouter();
  const { reportId } = router.params;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        if (reportId) {
          const reportRef = ref(db, `reports/${reportId}`);
          const reportSnapshot = await get(reportRef);

          if (reportSnapshot.exists()) {
            setReport(reportSnapshot.val());
          } else {
            console.error('Report not found');
          }
        }
      } catch (error) {
        console.error('Error fetching report details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  if (loading) {
    return (
      <AdminStyledContainer>
        <AdminHeader />
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading report details...</Text>
      </AdminStyledContainer>
    );
  }

  if (!report) {
    return (
      <AdminStyledContainer>
        <AdminHeader />
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Report not found.</Text>
      </AdminStyledContainer>
    );
  }
  return (
    <AdminStyledContainer>
      <AdminHeader />
      <View style={styles.header}>
        <Text style={styles.headerText}>Report Details</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.reportsContainer}>
          <View style={styles.reportDesc}>
            <Text style={styles.descName}>{report.reporterName || 'Unknown Reporter'}</Text>
            <Text style={styles.descMessage}>{report.details}</Text>
            <Text style={styles.descTime}>{report.time}</Text>
          </View>
          <Image
            source={
              report.reporterProfile
                ? { uri: report.reporterProfile }
                : require('@/assets/images/profile.png')
            }
            style={styles.reportImage}
          />
        </View>
        <View style={styles.information}>
          <Text style={styles.infoText}>Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Date:</Text>
              <Text style={styles.infoDesc}>{report.date || 'N/A'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Category:</Text>
              <Text style={styles.infoDesc}>{report.category || 'N/A'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Location:</Text>
              <Text style={styles.infoDesc}>{report.location || 'N/A'}</Text>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: 0, // add coordinates
                  longitude: 0, // add coordinates
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.00001,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: 0, // add coordinates
                    longitude: 0, // add coordinates
                  }}
                  pinColor="red"
                />
              </MapView>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoHeaderText, styles.pad]}>Emergency Details</Text>
              <Text style={styles.infoDesc}>{report.details || 'No details available.'}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoHeaderText, styles.pad]}>Images</Text>
              <View style={styles.imageContainer}>
                <Image source={require('@/assets/images/policeman.png')} style={styles.image} />
                <Image source={require('@/assets/images/policeman.png')} style={styles.image} />
                <Image source={require('@/assets/images/policeman.png')} style={styles.image} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminStyledContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'scroll',
    backgroundColor: '#faf9f6',
    paddingBottom: 50,
    borderTopWidth: 2,
    borderTopColor: '#dfdedd',
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingRight: 60,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#dfdedd',
  },
  reportImage: {
    resizeMode: 'cover',
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#343434',
  },
  reportDesc: {
    flex: 1,
  },
  descTime: {
    fontSize: 18,
    fontFamily: 'BeVietnamProRegular',
  },
  descName: {
    fontSize: 36,
    fontFamily: 'BeVietnamProBold',
    color: '#016ea6',
  },
  descMessage: {
    fontSize: 20,
    fontFamily: 'BeVietnamProBold',
    width: '95%',
    color: '#b0adad',
  },
  information: {
    flex: 1,
    padding: 20,
  },
  infoText: {
    fontSize: 36,
    fontFamily: 'BeVietnamProBold',
    color: '#016ea6',
  },
  infoContainer: {
    flex: 1,
    gap: 5,
    paddingVertical: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  info: {
    flexDirection: 'row',
    gap: 5,
  },
  infoColumn: {
    width: '100%',
  },
  infoHeaderText: {
    fontSize: 22,
    fontFamily: 'BeVietnamProBold',
    color: '#b0adad',
  },
  infoDesc: {
    fontSize: 22,
    fontFamily: 'BeVietnamProBold',
    color: '#000',
  },
  pad: {
    paddingTop: 25,
  },
  imageContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 30,
    gap: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 220, //change this if the space below of scroll view is too big/small
  },
  image: {
    resizeMode: 'cover',
    width: 110,
    height: 110,
  },
  mapContainer: {
    width: '100%',
    height: '30%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },
});
