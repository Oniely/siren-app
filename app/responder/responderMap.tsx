import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar as STATUSBAR,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '@/firebaseConfig';
import { ref, onValue, update, onDisconnect } from 'firebase/database';
import * as Location from 'expo-location';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Modalize } from 'react-native-modalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScaledSheet } from 'react-native-size-matters';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDate } from '@/constants/Date';
import { mapStyle } from '@/constants/Map';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import Loading from '@/components/app/Loading';

export interface Report {
  reportId: string;
  senderId: string;
  senderName: string;
  category: string;
  details: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: number;
  timestamp: number;
  status: string;
  assets: any[];
  responderId: string;
}

type LocationCoords = {
  latitude: number;
  longitude: number;
};

const ResponderMap = () => {
  const [responderLocation, setResponderLocation] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [responderId, setResponderId] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const router = useRouter();
  const modalizeRef = useRef(null);

  const onOpen = () => {
    // @ts-ignore
    modalizeRef.current?.open();
  };
  const onClose = () => {
    // @ts-ignore
    modalizeRef.current?.close();
  };

  const resetSelectedReport = () => setSelectedReport(null);
  const handleMarkerPress = (report: any) => {
    setSelectedReport(report);
    console.log(report.status);
    setIsButtonDisabled(report.status === 'Accepted' || report.status === 'Reviewed');
    onOpen();
  };
  useEffect(() => {
    console.log('Selected Report:', selectedReport);
    console.log('Is Button Disabled:', isButtonDisabled);
  }, [selectedReport, isButtonDisabled]);
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);

        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.role === 'responder') {
            setResponderId(user.uid);
          } else {
            console.error('Logged-in user is not a responder.');
          }
        });
      } else {
        console.error('No user is logged in.');
      }
    });

    return () => unsubscribe();
  }, []);

  const confirmStatus = () => {
    if (!selectedReport || !responderLocation || !responderId) {
      console.error('Invalid state for confirming status');
      return;
    }
    const reportRef = ref(db, `reports/${selectedReport.reportId}`);
    update(reportRef, {
      status: 'Accepted',
      responderId: responderId,
    })
      .then(() => {
        console.log('Report accepted');
        updateResponderLocation(responderId, responderLocation);
        resetSelectedReport();
      })
      .catch((error: Error) => {
        console.error('Error updating status:', error.message);
      });
    onClose();
  };

  const declineStatus = () => {
    if (!selectedReport) {
      console.error('No report selected');
      return;
    }
    const reportRef = ref(db, `reports/${selectedReport.reportId}`);
    update(reportRef, { status: 'Declined' })
      .then(() => {
        console.log('Report declined');
        resetSelectedReport();
      })
      .catch((error: Error) => {
        console.error('Error updating status:', error.message);
      });
  };

  async function updateResponderLocation(responderId: string, location: LocationCoords) {
    try {
      const responderRef = ref(db, `responders/${responderId}`);
      await update(responderRef, {
        latitude: location.latitude,
        longitude: location.longitude,
        status: 'Active',
      });

      onDisconnect(responderRef).update({ status: 'Inactive' });
      console.log('Responder location and status updated successfully');
    } catch (error) {
      console.error('Error updating responder location:');
    }
  }

  useEffect(() => {
    const startResponderLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location denied');
        router.back();
      }

      const responderId = auth.currentUser?.uid;
      if (!responderId) {
        console.error('Responder ID is undefined. User might not be logged in.');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          const locationCoords = { latitude, longitude };
          setResponderLocation(locationCoords);
          updateResponderLocation(responderId, locationCoords);
        }
      );

      return () => locationSubscription?.remove();
    };

    const fetchReportsWithSenderNames = async () => {
      const reportsRef = ref(db, 'reports');
      // const usersRef = ref(db, 'users');

      onValue(reportsRef, (snapshot) => {
        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const reportPromises = Object.values(reportsData).map(async (report: any) => {
            return new Promise((resolve) => {
              onValue(ref(db, `users/${report.senderId}`), (userSnapshot) => {
                const userData = userSnapshot.exists() ? userSnapshot.val() : { name: 'Unknown' };
                resolve({
                  ...report,
                  senderName: userData.firstname + ' ' + userData.lastname,
                });
              });
            });
          });
          Promise.all(reportPromises).then((fetchedReports) => {
            setReports(fetchedReports);
          });
        }
      });
    };

    startResponderLocationTracking();
    fetchReportsWithSenderNames();
  }, []);

  // wait for responderLocation to update before loading to prevent map from centering on default location
  if (!responderLocation) return <Loading />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient colors={['#e6e6e6', 'rgba(0, 0, 255, 0)']} style={styles.gradient} />
        <View style={styles.headers}>
          <View style={styles.indexTopBar}>
            <View style={styles.topBarLeft}>
              <Image source={require('@/assets/images/profile.png')} style={styles.topBarImage} />
              <View>
                <Text style={styles.topBarName}>RESPONDER</Text>
                <Text style={styles.topBarLink}>0912309123</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Image source={require('@/assets/images/close_btn.png')} style={styles.closeBtn} />
            </TouchableOpacity>
          </View>
          <View style={styles.bigTextContainer}>
            <Text style={styles.bigText}>Emergency Response</Text>
            <Text style={styles.smallText}>
              Displays a live map view showing ongoing emergency responses for individuals in need of
              assistance.
            </Text>
          </View>
        </View>
        <MapView
          style={styles.map}
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: responderLocation?.latitude || 12.8797,
            longitude: responderLocation?.longitude || 121.774,
            latitudeDelta: 0.1,
            longitudeDelta: 0.001,
          }}
        >
          {/* Responder Marker */}
          {responderLocation && (
            <Marker
              coordinate={{
                latitude: responderLocation.latitude,
                longitude: responderLocation.longitude,
              }}
              title="Responder"
              pinColor="blue"
            />
          )}
          {reports.map((report, index) => {
            let markerColor = 'red';
            if (report.status === 'Accepted') {
              markerColor = 'green'; // Accepted
            } else if (report.status === 'Reviewed') {
              markerColor = 'orange'; // Reviewed
            }

            return (
              <Marker
                key={index}
                coordinate={report.location}
                title={report.senderName}
                description={report.category}
                onPress={(e: any) => {
                  e.persist();
                  handleMarkerPress(report);
                }}
              >
                <Entypo name="location-pin" size={60} color={markerColor} />
              </Marker>
            );
          })}
        </MapView>
        <Modalize ref={modalizeRef} snapPoint={350} onClose={resetSelectedReport}>
          <View style={styles.modal}>
            <View style={[styles.flexRowCenter, styles.borderBottom, { paddingTop: 15 }]}>
              <Image source={require('@/assets/images/profile.png')} />
              <View>
                <Text style={styles.profileStatus}>{selectedReport?.status || ''}</Text>
                <Text style={styles.profileName}>{selectedReport?.senderName || ''}</Text>
                <Text style={styles.emergency}>Emergency Type: {selectedReport?.category || ''}</Text>
              </View>
            </View>
            <View style={[styles.flexRowCenter, { paddingHorizontal: 5 }]}>
              <FontAwesome6 name="location-dot" size={50} color="#343434" />
              <Text style={styles.location}>
                {selectedReport?.location.latitude}, {selectedReport?.location.longitude}
              </Text>
            </View>
            {!(selectedReport?.status === 'Accepted' || selectedReport?.status === 'Reviewed') && (
              <TouchableOpacity
                style={[styles.borderBottom, isButtonDisabled && styles.buttonDisabled]}
                onPress={confirmStatus}
                disabled={isButtonDisabled}
              >
                <Text style={styles.primaryButton}>Respond to Emergency</Text>
              </TouchableOpacity>
            )}
            <Text style={[styles.headerText, styles.borderBottom]}>Emergency Details</Text>
          </View>
          <View style={styles.bottomContainer}>
            <View style={[styles.reportsContainer, styles.borderBottom]}>
              <View style={styles.reportDesc}>
                <Text style={styles.descName}>{selectedReport?.senderName}</Text>
                <Text style={styles.descMessage} numberOfLines={2}>
                  {selectedReport?.details}
                </Text>
                <Text style={styles.descTime}>12:01AM</Text>
              </View>
              <Image source={require('@/assets/images/profile.png')} style={styles.reportImage} />
            </View>
            <View style={styles.information}>
              <Text style={styles.infoText}>Information</Text>
              <View style={styles.infoContainer}>
                <View style={styles.info}>
                  <Text style={styles.infoHeaderText}>Date:</Text>
                  <Text style={styles.infoDesc}>{formatDate(selectedReport?.createdAt!)}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.infoHeaderText}>Category:</Text>
                  <Text style={styles.infoDesc}>{selectedReport?.category}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.infoHeaderText}>Location:</Text>
                  <Text style={styles.infoDesc}>
                    {selectedReport?.location.latitude}, {selectedReport?.location.longitude}
                  </Text>
                </View>
                <View style={styles.mapContainer}>
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: selectedReport?.location.latitude!,
                      longitude: selectedReport?.location.longitude!,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.00001,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: selectedReport?.location.latitude!,
                        longitude: selectedReport?.location.longitude!,
                      }}
                      pinColor="red"
                    />
                  </MapView>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={[styles.infoHeaderText, styles.pad]}>Emergency Details</Text>
                  <Text style={styles.infoDesc}>{selectedReport?.details}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={[styles.infoHeaderText, styles.pad]}>Images</Text>
                  <View style={styles.imageContainer}>
                    {selectedReport?.assets.map((item: any, idx: number) => (
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
          </View>
        </Modalize>
      </View>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  modal: {
    flex: 1,
    padding: '20@ms',
    borderRadius: '30@ms',
    gap: '30@vs',
  },
  flexRowCenter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '15@s',
  },
  borderBottom: {
    paddingBottom: '30@vs',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  profileName: {
    fontSize: '16@ms',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#343434',
  },
  emergency: {
    fontSize: '14@ms',
    fontFamily: 'BeVietnamProRegular',
    color: '#b0adad',
  },
  location: {
    fontSize: '15@ms',
    fontFamily: 'BeVietnamProBold',
    color: '#087bb8',
  },
  primaryButton: {
    fontSize: '16@ms',
    fontFamily: 'BeVietnamProMedium',
    color: '#FFF',
    backgroundColor: '#0c0c63',
    textAlign: 'center',
    paddingVertical: '15@s',
    borderRadius: '10@ms',
  },
  headerText: {
    fontSize: '24@ms',
    fontFamily: 'BeVietnamProBold',
  },
  bottomContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'scroll',
    paddingBottom: 50,
  },
  reportsContainer: {
    padding: '20@s',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@s',
    paddingVertical: '20@s',
    paddingHorizontal: '20@s',
    paddingRight: '60@s',
    overflow: 'hidden',
  },
  reportImage: {
    resizeMode: 'cover',
    width: '90@s',
    height: '90@s',
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
  indexTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5@s',
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
    fontSize: '12@s',
    color: '#343434',
  },
  topBarLink: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: '12@s',
    color: '#3998ff',
  },
  headers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: Platform.OS == 'android' ? STATUSBAR.currentHeight : 0,
    paddingHorizontal: '20@s',
  },
  closeBtn: {
    width: '20@s',
    height: '20@s',
  },
  bigTextContainer: {
    padding: '10@s',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5@vs',
    marginTop: '5@vs',
  },
  bigText: {
    fontSize: '20@ms',
    fontFamily: 'BeVietnamProMedium',
    color: '#0b0c63',
  },
  smallText: {
    fontSize: '12@ms',
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
    height: '200@vs',
  },
  buttonDisabled: {
    backgroundColor: 'fff',
  },
  profileStatus: {
    fontStyle: 'italic',
  },
});

export default ResponderMap;
