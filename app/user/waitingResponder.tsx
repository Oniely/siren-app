import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar as STATUSBAR,
  Dimensions,
} from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import { db, auth } from '@/firebaseConfig';
import { ref, get, onValue } from 'firebase/database';
import { useRouter } from 'expo-router';
import { mapStyle } from '@/constants/Map';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Loading from '@/components/app/Loading';
import { Report } from '../responder/responderMap';

const WaitingResponder: React.FC = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // Modal state
  const [profileData, setProfileData] = useState<any>(null);
  const [responderLocation, setResponderLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    fetchProfileData();
    const fetchUserReports = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error('No user ID found');

        const reportsRef = ref(db, `reports`);
        const snapshot = await get(reportsRef);

        if (snapshot.exists()) {
          const reportsData: Record<string, Report> = snapshot.val();
          const matchingReports = Object.values(reportsData).filter(
            (report) => report.senderId === userId && report.location
          );
          setReports(matchingReports);
          if (matchingReports.length > 0) {
            const latestReport: Report = matchingReports[0];
            setLocation(latestReport?.location || null);

            // Set up live responder tracking if status is "Accepted"
            if (latestReport.status === 'Accepted') {
              const responderId = latestReport.responderId; // Replace with actual responder ID
              const responderRef = ref(db, `responders/${responderId}`);
              const unsubscribeResponder = onValue(responderRef, (snapshot) => {
                if (snapshot.exists()) {
                  // setModalVisible(true);
                  const data = snapshot.val();
                  setResponderLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                  });
                }
              });

              // Clean up the listener
              return () => {
                unsubscribeResponder();
              };
            }
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
    fetchUserReports();
  }, [reports]);

  // Ensure map only updates when both responder and report data are present
  useEffect(() => {
    if (reports.length > 0 && responderLocation) {
      const coordinates: LatLng[] = [
        ...reports.map((report) => ({
          latitude: report.location?.latitude || 0,
          longitude: report.location?.longitude || 0,
        })),
        {
          latitude: responderLocation.latitude,
          longitude: responderLocation.longitude,
        },
      ];

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [reports, responderLocation]);

  if (loading) return <Loading />;

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text>No location data available for your reports.</Text>
      </View>
    );
  }

  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      console.log('Timer finished');
      setModalVisible(true);
    }, 300000);
  };

  const handleNotYet = () => {
    console.log('Not Yet clicked, restarting timer');
    setModalVisible(false); // Hide the modal
    startTimer(); // Restart the timer
  };

  useEffect(() => {
    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const currentReport = reports.length > 0 ? reports[0] : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#e6e6e6', 'rgba(0, 0, 255, 0)']} style={styles.gradient} />
      <View style={styles.headers}>
        <View style={styles.indexTopBar}>
          <View style={styles.topBarLeft}>
            <Image source={require('@/assets/images/profile.png')} style={styles.topBarImage} />
            <View>
              <Text style={styles.topBarName}>{profileData?.username || 'Unknown User'}</Text>
              <Text style={styles.topBarLink}>0912309123</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Image source={require('@/assets/images/close_btn.png')} style={styles.closeBtn} />
          </TouchableOpacity>
        </View>
        <View style={styles.bigTextContainer}>
          <Text style={styles.bigText}>
            {currentReport.status === 'Reported' ? 'Waiting for Responder' : 'Responder on the Way'}
          </Text>
          <Text style={styles.smallText}>
            {currentReport.status === 'Reported'
              ? 'Your contact persons nearby, ambulance/police contacts will see your request for help.'
              : 'A responder is en route to your location. Please stay safe.'}
          </Text>
        </View>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: location?.latitude || 12.8797,
          longitude: location?.longitude || 121.774,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* User's Report Locations */}
        {reports.map((report, index) =>
          report.location ? (
            <Marker
              key={index}
              coordinate={report.location}
              title={`Report ${report.id}`}
              description="Reported location"
              pinColor="red"
            />
          ) : null
        )}
        {responderLocation && (
          <Marker
            coordinate={{
              latitude: responderLocation.latitude,
              longitude: responderLocation.longitude,
            }}
            title="Responder Location"
            description="This is the current location of the responder."
            pinColor="blue"
            zIndex={1000}
          />
        )}
      </MapView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Is the emergency responded?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.declineModalButtons, styles.modalButton]}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonTextNo}>Not Yet</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmModalButtons, styles.modalButton]}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/user/response_review'); // Replace with the actual review page route
                }}
              >
                <Text style={styles.buttonTextYes}>Review</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="dark" />
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
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    bottom: 10,
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  indexTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  topBarImage: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 999,
  },
  topBarName: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 12,
    color: '#343434',
  },
  topBarLink: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: 12,
    color: '#3998ff',
  },
  headers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: Platform.OS == 'android' ? STATUSBAR.currentHeight : 0,
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 20,
    height: 20,
  },
  bigTextContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
  bigText: {
    fontSize: 20,
    fontFamily: 'BeVietnamProMedium',
    color: '#0b0c63',
  },
  smallText: {
    fontSize: 12,
    fontFamily: 'BeVietnamProRegular',
    color: '#231f20',
    textAlign: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    width: Dimensions.get('window').width,
    height: 200,
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  confirmModalButtons: {
    backgroundColor: '#fff', // Green for Yes
    borderWidth: 1,
    borderColor: '#0c0c63',
  },
  declineModalButtons: {
    backgroundColor: '#fff', // Green for Yes
    borderWidth: 1,
    borderColor: '#F44336',
  },
  buttonTextYes: {
    fontSize: 16,
    fontFamily: 'BeVietnamProRegular',
    color: '#0c0c63',
    fontWeight: 'bold',
  },
  buttonTextNo: {
    fontSize: 16,
    fontFamily: 'BeVietnamProRegular',
    color: '#F44336',
    fontWeight: 'bold',
  },
});
