import { View, Text, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { useRouter } from 'expo-router';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { formatDate } from '@/constants/Date';
import { ScaledSheet } from 'react-native-size-matters';
import Loading from '@/components/app/Loading';

export default function ReportDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        if (id) {
          const reportRef = ref(db, `reports/${id}`);
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
  }, []);

  if (loading) return <Loading />;

  return (
    <AdminStyledContainer>
      <AdminHeader />
      <View style={styles.header}>
        <Text style={styles.headerText}>Report Details</Text>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.reportsContainer}>
          <View style={styles.reportDesc}>
            <Text style={styles.descName}>{report?.reporterName || 'Unknown Reporter'}</Text>
            <Text style={styles.descMessage}>{report?.details || ''}</Text>
            <Text style={styles.descTime}>
              {report?.timestamp ? formatDate(report.timestamp) : 'Datetime'}
            </Text>
          </View>
          <Image
            source={
              report?.reporterProfile
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
              <Text style={styles.infoDesc}>{report?.date || 'N/A'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Category:</Text>
              <Text style={styles.infoDesc}>{report?.category || 'N/A'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoHeaderText}>Location:</Text>
              <Text style={styles.infoDesc}>
                {`${report?.location.latitude || 'City'} ${report?.location.longitude || 'of Bacolod'}`}
              </Text>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: report?.location.latitude || 0,
                  longitude: report?.location.longitude || 0,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.00001,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: report?.location.latitude || 0,
                    longitude: report?.location.longitude || 0,
                  }}
                  pinColor="red"
                />
              </MapView>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoHeaderText, styles.pad]}>Emergency Details</Text>
              <Text style={styles.infoDesc}>{report?.details || 'No details available.'}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoHeaderText, styles.pad]}>Images</Text>
              <View style={styles.imageContainer}>
                {report?.assets.map((item: any, idx: number) => (
                  <Image
                    source={item ? { uri: item.url } : require('@/assets/images/policeman.png')}
                    style={styles.image}
                    key={idx}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminStyledContainer>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'scroll',
    backgroundColor: '#faf9f6',
    paddingBottom: '50@s',
    borderTopWidth: 2,
    borderTopColor: '#dfdedd',
  },
  header: {
    paddingHorizontal: '20@s',
    paddingVertical: '15@vs',
    backgroundColor: '#e6e6e6',
  },
  headerText: {
    fontSize: '24@ms',
    fontFamily: 'BeVietnamProBold',
  },
  reportsContainer: {
    padding: '20@s',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@s',
    paddingVertical: '20@vs',
    paddingHorizontal: '20@s',
    paddingRight: '60@s',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#dfdedd',
  },
  reportImage: {
    resizeMode: 'cover',
    width: '90@s',
    height: '90@vs',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#343434',
  },
  reportDesc: {
    flex: 1,
  },
  descTime: {
    fontSize: '14@ms',
    fontFamily: 'BeVietnamProRegular',
    color: '#646b79',
  },
  descName: {
    fontSize: '16@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#016ea6',
  },
  descMessage: {
    fontSize: '14@ms',
    fontFamily: 'BeVietnamProMedium',
    width: '95%',
    color: '#b0adad',
  },
  information: {
    flex: 1,
    padding: '24@s',
  },
  infoText: {
    fontSize: '24@ms',
    fontFamily: 'BeVietnamProBold',
    color: '#016ea6',
  },
  infoContainer: {
    flex: 1,
    gap: '5@s',
    paddingVertical: '8@vs',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  info: {
    flexDirection: 'row',
    gap: '5@s',
  },
  infoColumn: {
    width: '100%',
  },
  infoHeaderText: {
    fontSize: '16@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#b0adad',
  },
  infoDesc: {
    fontSize: '16@ms',
    fontFamily: 'BeVietnamProMedium',
    color: '#343434',
  },
  pad: {
    paddingTop: '25@vs',
  },
  imageContainer: {
    width: '100%',
    height: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: '30@vs',
    gap: '5@s',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: '220@vs',
  },
  image: {
    resizeMode: 'cover',
    width: '90@s',
    height: '90@s',
  },
  mapContainer: {
    width: '100%',
    height: '30%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    marginTop: '10@vs',
  },
});
