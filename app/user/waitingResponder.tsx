import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '@/firebaseConfig';
import { ref, get } from 'firebase/database';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

const WaitingResponder: React.FC = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);

  const fetchProfileData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user ID found');

      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setProfileData(snapshot.val());
      } else {
        console.log('No profile data available');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserReports = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user ID found');

      const reportsRef = ref(db, `reports`);
      const snapshot = await get(reportsRef);

      if (snapshot.exists()) {
        const reports = Object.values(snapshot.val());
        const matchingReports = reports.filter((report: any) => report.senderId === userId);

        if (matchingReports.length > 0) {
          setReports(matchingReports);
          setLocation(matchingReports[0]?.location || null);
        } else {
          console.error('No matching reports found for this user');
        }
      } else {
        console.error('No reports found in database');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchUserReports();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text>No location data available for your reports.</Text>
      </View>
    );
  }

  const currentReport = reports.length > 0 ? reports[0] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSide}>
          <Pressable>
            <Image source={require('@/assets/images/profile-logo.png')} style={styles.police} />
          </Pressable>
          <View style={styles.leftText}>
            <Text style={styles.textNumber}>{profileData?.username || 'Unknown User'}</Text>
            <Text style={styles.textName}>{profileData?.email || 'No Email Provided'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <AntDesign name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <ImageBackground
        source={require('@/assets/images/gradient_background.png')}
        style={styles.mainText}
        resizeMode="cover"
      >
        {currentReport ? (
          <>
            <Text style={styles.bigText}>
              {currentReport.status === 'Reported' ? 'Waiting for Responder' : 'Responder on the Way'}
            </Text>
            <Text style={styles.smallText}>
              {currentReport.status === 'Reported'
                ? 'Your contact persons nearby, ambulance/police contacts will see your request for help.'
                : 'A responder is en route to your location. Please stay safe.'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.bigText}>No Reports Found</Text>
            <Text style={styles.smallText}>Please submit a report to get assistance.</Text>
          </>
        )}
      </ImageBackground>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Reported Location"
          description="This is the reported location"
        />
      </MapView>
    </View>
  );
};

export default WaitingResponder;

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    height: 100,
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 11,
    backgroundColor: '#e6e6e6',
  },
  leftSide: {
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
  },
  closeButton: {
    top: 40,
    right: 20,
  },
  leftText: {
    flexDirection: 'column',
    top: 40,
    left: 30,
  },
  textName: {},
  textNumber: {},
  police: {
    top: 40,
    left: 20,
    resizeMode: 'stretch',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  mainText: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    height: '60%',
    display: 'flex',
    width: '100%',
    flex: 1,
  },
  bigText: {
    color: '#0b0c63',
    fontSize: 40,
    bottom: '15%',
    textAlign: 'center',
  },
  smallText: {
    bottom: '15%',
    textAlign: 'center',
    fontSize: 24,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
