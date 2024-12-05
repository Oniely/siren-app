import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MI from 'react-native-vector-icons/MaterialIcons';
import SLI from 'react-native-vector-icons/SimpleLineIcons';

import Container from '@/components/Container';
import MapReport from '@/components/map/MapReport';
import FilterButton from '@/components/FilterButton';
import DateTimeInput from '@/components/DateTimeInput';
import Video, { VideoRef } from 'react-native-video';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { push, ref, set } from 'firebase/database';
import { getDownloadURL, uploadBytes, ref as reference } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Route } from 'expo-router/build/Route';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import HeaderText from '@/components/app/HeaderText';
import Loading from '@/components/app/Loading';

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
    name: 'Fires and Explotions',
    img: require('@/assets/images/fire.png'),
  },
  {
    name: 'Road Accidents',
    img: require('@/assets/images/road.png'),
  },
];

const ReportEmergency = () => {
  const router = useRouter();

  const [reportId, setreportId] = useState(false);
  const [showCateg, setShowCateg] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [details, setDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCateg, setSelectedCateg] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ file: any; url: string }[]>([]);

  const [location, setLocation] = useState<LocationProp | null>(null);
  const [status, setStatus] = useState('Standby');

  useEffect(() => {
    (async () => {
      const { status: STATUS } = await Location.requestForegroundPermissionsAsync();
      if (STATUS !== 'granted') {
        router.back();
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      console.log(currentLocation);
      setLocation(currentLocation);
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

  const uploadMediaToStorage = async (mediaFiles: any) => {
    setStatus('Uploading');
    const uploadedUrls = [];

    for (const file of mediaFiles) {
      const { uri, fileName, type } = file; // Get file details
      console.log(file);
      const response = await fetch(uri); // Convert to blob
      const blob = await response.blob();
      console.log(storage);
      const storageRef = reference(storage, `reports/${fileName}`); // Firebase Storage reference
      console.log('REF', storageRef);

      try {
        const snapshot = await uploadBytes(storageRef, blob); // Upload file
        console.log('File uploaded successfully:', snapshot);

        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push({ file: file, url: downloadURL });

        console.log(downloadURL);
        setStatus('Uploaded');
      } catch (error) {
        setStatus('Upload error');
        console.error('Error uploading file:', error);
      }
    }

    setImageUrls(uploadedUrls);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 3,
      includeBase64: false,
    });

    if (result.assets && result.assets.length > 0) {
      setSelectedMedia(result.assets);
      uploadMediaToStorage(result.assets);
    }
  };

  const submit = async (
    date: Date,
    latitude: number,
    longitude: number,
    details: string,
    assets: { file: any; url: string }[],
    category: string
  ) => {
    console.log('Submit function started');
    console.log('Data to be submitted:', {
      date,
      latitude,
      longitude,
      details,
      assets,
      category,
    });

    const defaultLatitude = 37.7749; // Example: San Francisco latitude
    const defaultLongitude = -122.4194; // Example: San Francisco longitude

    const finalLatitude = latitude ?? defaultLatitude;
    const finalLongitude = longitude ?? defaultLongitude;

    setStatus('Submitting');

    const userId = await AsyncStorage.getItem('userId');
    console.log('User ID:', userId);

    if (!userId) {
      console.error('No userId found in AsyncStorage');
      setStatus('Error: User ID not found');
      return;
    }

    const reportRef = ref(db, 'reports/');
    console.log('Firebase Reference:', reportRef);
    const newReportRef = push(reportRef);
    console.log('New Report Reference:', newReportRef);
    const reportId = newReportRef.key; // Retrieve the generated ID
    set(newReportRef, {
      reportId,
      status: 'Reported',
      timestamp: new Date(date).getTime(),
      location: { latitude: finalLatitude, longitude: finalLongitude },
      details,
      assets: assets ?? [],
      category,
      createdAt: Date.now(),
      senderId: userId,
    })
      .then(() => {
        console.log('Submitting report with the following data:');
        console.log('Report ID', reportId);
        console.log('Date:', selectedDate);
        console.log('Location:', location);
        console.log('Details:', details);
        console.log('Assets:', imageUrls);
        console.log('Category:', selectedCateg);
        console.log('User ID:', userId);
        console.log('Data saved successfully with auto ID!');
        setStatus('Submitted');
      })
      .catch((error) => {
        setStatus('Submitted error');
        console.error('Error writing document: ', error);
      });

    // if (!selectedDate || !location.latitude || !location.longitude || !details || !selectedCateg) {
    //   console.error('All fields must be filled');
    //   setStatus('Error: Missing fields');
    //   return;
    // }
    // if (imageUrls.length === 0) {
    //   console.error('No media uploaded');
    //   setStatus('Error: No media uploaded');
    //   return;
    // }
  };

  return (
    <Container bg="#faf9f6" statusBarStyle="light">
      <HeaderText text="Report Emergency" bg="#e6e6e6" />
      {status === 'Submitted' ? (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: '#08B6D9', fontSize: 20, fontWeight: 'bold' }}>
            Successfully submitted report
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.reportContainer}>
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
          <View style={styles.emergencyUpload}>
            <Text style={styles.emergencyUploadText}>Photos/Videos</Text>
            {imageUrls && imageUrls.length > 0 ? (
              <View style={styles.uploadDetails}>
                {imageUrls.map((media: any, index: number) => {
                  if (media.file.type.includes('video')) {
                    return (
                      <Video
                        key={index}
                        // Can be a URL or a local file.
                        source={{ uri: media.url }}
                        // Store reference
                        // ref={videoRef}
                        // Callback when remote video is buffering
                        // onBuffer={onBuffer}
                        // // Callback when video cannot be loaded
                        // onError={onError}
                        // style={styles.backgroundVideo}
                        style={{ width: 80, height: 80 }}
                      />
                    );
                  } else {
                    return (
                      <Image key={index} source={{ uri: media.url }} style={{ width: 80, height: 80 }} />
                    );
                  }
                })}
              </View>
            ) : (
              <View style={styles.iconUpload}>
                <TouchableOpacity onPress={pickImage}>
                  <SLI name="cloud-upload" size={40} color={'#0B0C63'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={takePicture}>
                  <SLI name="camera" size={40} color={'#0B0C63'} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <Pressable
            style={styles.button}
            disabled={status === 'Submitting' || status === 'Uploading'}
            onPress={() => {
              console.log('Submit button clicked'); // Debugging
              submit(
                selectedDate,
                location.coords.latitude,
                location.coords.longitude,
                details,
                imageUrls,
                selectedCateg
              );
              router.navigate('/user/waitingResponder');
            }}
          >
            <Text style={styles.buttonText}>Submit Report</Text>
          </Pressable>
        </ScrollView>
      )}
    </Container>
  );
};

export default ReportEmergency;

const styles = StyleSheet.create({
  reportContainer: {
    flex: 1,
    gap: 20,
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
    backgroundColor: '#e6e6e6',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'space-between',
    padding: 5,
    borderRadius: 10,
    position: 'relative',
    overflow: 'scroll',
  },
  filterCategory: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    justifyContent: 'space-between',
    borderRadius: 10,
    position: 'relative',
  },
  location: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    width: '86%',
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
    width: '84%',
    marginHorizontal: 'auto',
    marginTop: 20,
    height: '20%',
  },
  emergencyDetailsText: {
    color: '#0B0C63',
    fontFamily: 'BeVietnamProRegular',
    fontSize: 18,
  },
  emergencyUpload: {
    width: '86%',
    marginHorizontal: 'auto',
    marginTop: 30,
    height: '20%',
  },
  emergencyUploadText: {
    color: '#0B0C63',
    fontFamily: 'BeVietnamProRegular',
    fontSize: 18,
  },
  uploadDetails: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginVertical: 5,
    backgroundColor: '#e6e6e6',
    marginTop: 10,
  },
  detailsInput: {
    borderWidth: 1,
    textAlignVertical: 'top',
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  iconUpload: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
    gap: 20,
  },
  button: {
    backgroundColor: '#0B0C63',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '86%',
    marginHorizontal: 'auto',
    marginVertical: 40,
    zIndex: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'BeVietnamProSemiBold',
  },
});
