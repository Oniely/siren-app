import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MI from 'react-native-vector-icons/MaterialIcons';
import SLI from 'react-native-vector-icons/SimpleLineIcons';

import Container from '@/components/Container';
import MapReport from '@/components/map/MapReport';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { push, ref, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

import { db, storage } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';

import HeaderText from '@/components/app/HeaderText';
import Loading from '@/components/app/Loading';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface LocationProp {
  coords: {
    longitude: any;
    latitude: any;
  };
}

const category = [
  {
    name: 'Natural Disaster',
    img: require('@/assets/images/flood.png'),
  },
  {
    name: 'Fires and Explosions',
    img: require('@/assets/images/fire.png'),
  },
  {
    name: 'Road Accidents',
    img: require('@/assets/images/road.png'),
  },
];

const ReportEmergency = () => {
  const router = useRouter();
  const currentUser = getAuth().currentUser;
  const [reportImage, setReportImage] = useState<{ uri: string } | null>(null);
  const [reportId, setreportId] = useState(false);
  const [showCateg, setShowCateg] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [details, setDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCateg, setSelectedCateg] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [location, setLocation] = useState<LocationProp | null>(null);
  const [status, setStatus] = useState('Standby');
  const params = useLocalSearchParams();

  const { roomId, currentUserId, callerId, name = 'Unknown' } = params;
  console.log('Params:', params);
  useEffect(() => {
    (async () => {
      const { status: STATUS } = await Location.requestForegroundPermissionsAsync();
      if (STATUS !== 'granted') {
        router.back();
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      console.log(currentLocation);
      setLocation(currentLocation);
      console.log({ callerId, name });
    })();
  }, []);

  if (!location) return <Loading />;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: any) => {
    console.warn('A date has been picked: ', typeof date, date);
    setSelectedDate(date);
    hideDatePicker();
  };

  const takePicture = async () => {
    const result = await launchCamera({
      mediaType: 'mixed',
      saveToPhotos: true,
      durationLimit: 60,
      includeBase64: false,
      formatAsMp4: true,
    });

    console.log(result);

    if (result.assets && result.assets.length > 0) {
      setSelectedMedia(result.assets);
    }
  };

  const submit = async (
    callerId: string,
    name: string,
    date: Date,
    latitude: number,
    longitude: number,
    details: string,
    category: string,
    reportImage: any // The image selected for the report
  ) => {
    console.log('Submit function started');
    console.log('Data to be submitted:', {
      callerId,
      name,
      date,
      latitude,
      longitude,
      details,
      category,
      reportImage,
    });

    const defaultLatitude = 37.7749; // Example: San Francisco latitude
    const defaultLongitude = -122.4194; // Example: San Francisco longitude

    const finalLatitude = latitude ?? defaultLatitude;
    const finalLongitude = longitude ?? defaultLongitude;

    setStatus('Submitting');

    // const userId = await AsyncStorage.getItem('userId');
    // console.log('User ID:', userId);

    // if (!userId) {
    //   console.error('No userId found in AsyncStorage');
    //   setStatus('Error: User ID not found');
    //   return;
    // }

    try {
      const reportRef = push(ref(db, 'reports/'));
      const reportId = reportRef.key;

      await set(reportRef, {
        reportId,
        timestamp: selectedDate.getTime(),
        location: location?.coords || { latitude: 0, longitude: 0 },
        details,
        category: selectedCateg,
        senderId: callerId,
        status: 'Accepted',
        createdAt: Date.now(),
      });

      setStatus('Submitted');
      alert('Report successfully submitted.');
    } catch (error) {
      console.error('Error submitting report:', error);
      setStatus('Error');
    }
  };

  if (!location) {
    return <Loading />;
  }
  const cancelReport = () => {
    // Confirm if the user wants to cancel
    Alert.alert(
      'Cancel Report',
      'Are you sure you want to cancel this report? You will be redirected to the home page.',
      [
        {
          text: 'No',
          style: 'cancel', // Dismiss the alert without any action
        },
        {
          text: 'Yes',
          onPress: () => {
            // Redirect the responder to the home page
            router.push('/responder/');
          },
          style: 'destructive', // Highlight action
        },
      ]
    );
  };
  const handleSubmit = async () => {
    setStatus('Uploading');
    try {
      await submit(
        callerId,
        name,
        selectedDate,
        location.coords.latitude,
        location.coords.longitude,
        details,
        selectedCateg,
        reportImage
      );
      setStatus('Submitted');
      router.navigate('/responder/responderMap');
    } catch (error) {
      console.error('Error during report submission:', error);
      setStatus('Error');
    }
  };
  return (
    <Container bg="#faf9f6" statusBarStyle="light">
      <View style={[styles.header, { backgroundColor: '#e6e6e6' }]}>
        <Text>Report Emergency</Text>
      </View>
      <ScrollView style={styles.reportContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Caller ID</Text>
          <TextInput placeholder="Caller ID" style={styles.input} value={callerId} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Caller Name</Text>
          <TextInput
            placeholder="Caller Name"
            style={styles.input}
            value={name || 'No Name Provided'}
            editable={false}
          />
        </View>
        <View style={styles.filterRowContainer}>
          <TouchableOpacity style={styles.filter} onPress={showDatePicker}>
            <Text>{selectedDate ? selectedDate.toLocaleString() : 'Date Time'}</Text>
            <MI name="calendar-month" size={24} color={'#0c0c63'} />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
          <View style={[styles.filterCategory]}>
            <TouchableOpacity
              style={[
                styles.filter,
                {
                  width: '100%',
                },
              ]}
              onPress={() => setShowCateg(!showCateg)}
            >
              <Text>{selectedCateg ? selectedCateg : 'Select Category'}</Text>
              <MI name={'arrow-downward'} size={30} color={'#0c0c63'} />
            </TouchableOpacity>
            {showCateg && (
              <View style={styles.categList}>
                {category.map((categ, index) => (
                  <TouchableOpacity
                    style={styles.category}
                    key={index}
                    onPress={() => {
                      setSelectedCateg(categ.name);
                      setShowCateg(false);
                    }}
                  >
                    <Image source={categ.img} style={styles.categoryImages} />
                    <Text style={styles.categoryNames}>{categ.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <MapReport location={location} handleLocation={setLocation} />
        <View style={styles.emergencyDetails}>
          <Text style={styles.emergencyDetailsText}>Emergency Details</Text>
          <TextInput
            placeholder="Ex. someone fell from the building, what do they need"
            style={styles.detailsInput}
            multiline={true}
            numberOfLines={7}
            value={details}
            onChangeText={setDetails}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.acceptbutton}
            disabled={status === 'Submitting' || status === 'Uploading'}
            onPress={handleSubmit} // Use the new function
          >
            <Text style={styles.buttonText}>Submit Report</Text>
          </Pressable>
          <Pressable
            style={styles.cancelbutton}
            disabled={status === 'Submitting' || status === 'Uploading'}
            onPress={cancelReport} // Use the new function
          >
            <Text style={styles.buttonText}>Cancel Report</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Container>
  );
};

export default ReportEmergency;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 25,
    gap: 5,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdb',
  },
  reportContainer: {
    flex: 1,
    gap: 20,
    paddingTop: 10,
    width: wp(100),
  },
  filterRowContainer: {
    flexDirection: 'row',
    width: '86%',
    marginHorizontal: 'auto',
    paddingBottom: 10,
    marginTop: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filter: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'scroll',
    borderWidth: 2,
    borderColor: '#0C0C63',
    borderRadius: 20,
    fontSize: 18,
    fontFamily: 'BeVietnamProRegular',
    padding: 10,
  },
  filterCategory: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    position: 'relative',
  },
  location: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    width: wp(84),
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 10,
    position: 'relative',
    zIndex: -1,
    marginHorizontal: 'auto',
  },

  categList: {
    position: 'absolute',
    width: '100%',
    bottom: -150,
    right: 0,
    padding: 5,
    backgroundColor: '#0C0C63',
    maxHeight: 150,
    height: 150,
    zIndex: 100,
    borderRadius: 10,
    overflow: 'scroll',
    gap: 10,
  },
  category: {
    flexDirection: 'row',
    backgroundColor: '#0C0C63',
    paddingVertical: 10,
    gap: 10,
    paddingLeft: 5,
    borderRadius: 5,
  },
  categoryNames: {
    color: '#e6e6e6',
  },
  categoryImages: {
    backgroundColor: '#e6e6e6',
  },
  emergencyDetails: {
    width: wp(84),
    marginHorizontal: 'auto',
    marginTop: 20,
    height: hp(15),
  },
  emergencyDetailsText: {
    color: '#0B0C63',
    fontFamily: 'BeVietnamProRegular',
    fontSize: 18,
  },
  detailsInput: {
    borderWidth: 2,
    borderColor: '#0C0C63',
    borderRadius: 20,
    textAlignVertical: 'top',
    marginTop: 10,
    padding: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 20,
    marginBottom: 70, // for older phones with visible navigation bar
  },
  acceptbutton: {
    backgroundColor: '#0B0C63',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: wp(40),
    marginVertical: 20,
    zIndex: 10,
  },
  cancelbutton: {
    backgroundColor: '#CD0000',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: wp(40),
    marginVertical: 0,
    zIndex: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BeVietnamProSemiBold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
    width: 120,
    height: 120,
  },
  inputContainer: {
    width: wp(86),
    marginHorizontal: 'auto',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#0C0C63',
    paddingLeft: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#0C0C63',
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'BeVietnamProRegular',
    marginTop: 10,
    padding: 10,
  },
});
