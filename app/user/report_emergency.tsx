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
import { getAuth } from 'firebase/auth';

import { getDownloadURL, uploadBytes, ref as storageRef } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Route } from 'expo-router/build/Route';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import HeaderText from '@/components/app/HeaderText';
import Loading from '@/components/app/Loading';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
  {
    name: 'Medical Issues',
    img: require('@/assets/images/heart.jpg'),
  },
  {
    name: 'Domestic Problems',
    img: require('@/assets/images/domestic.jpg'),
  },
  {
    name: 'Public Safety Threats',
    img: require('@/assets/images/safety.jpg'),
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
  const [imageUrls, setImageUrls] = useState<{ file: any; url: string }[]>([]);
  const [location, setLocation] = useState<LocationProp | null>(null);
  const [status, setStatus] = useState('Standby');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

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

  const pickMedia = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      setMediaFiles([...mediaFiles, ...result.assets]);
    }
  };
  const uploadMediaFiles = async () => {
    const uploadedFiles = [];
    for (const file of mediaFiles) {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileRef = storageRef(storage, `reports/${file.fileName}`);
        const snapshot = await uploadBytes(fileRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedFiles.push({ file, url: downloadURL });
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }
    // Update imageUrls state with uploaded file URLs
    setImageUrls(uploadedFiles);
    return uploadedFiles;
  };
  const submit = async (
    date: Date,
    latitude: number,
    longitude: number,
    details: string,
    assets: { file: any; url: string }[],
    category: string,
    reportImage: any // The image selected for the report
  ) => {
    console.log('Submit function started');
    console.log('Data to be submitted:', {
      date,
      latitude,
      longitude,
      details,
      assets,
      category,
      reportImage,
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

    let imageUrl = '';
    try {
      const uploadedMedia = await uploadMediaFiles();
      const reportRef = push(ref(db, 'reports/'));
      const reportId = reportRef.key;

      await set(reportRef, {
        reportId,
        timestamp: selectedDate.getTime(),
        location: location?.coords || { latitude: 0, longitude: 0 },
        details,
        category: selectedCateg,
        assets: uploadedMedia,
        senderId: userId,
        status: 'Reported',
        createdAt: Date.now(),
      });

      setStatus('Submitted');
      alert('Report successfully submitted.');
    } catch (error) {
      console.error('Error submitting report:', error);
      setStatus('Error');
    }
  };
  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...mediaFiles];
    updatedMedia.splice(index, 1);
    setMediaFiles(updatedMedia);
  };

  if (!location) {
    return <Loading />;
  }

  const handleSubmit = async () => {
    setStatus('Uploading');
    try {
      const uploadedMedia = await uploadMediaFiles();
      await submit(
        selectedDate,
        location.coords.latitude,
        location.coords.longitude,
        details,
        uploadedMedia,
        selectedCateg,
        reportImage
      );
      setStatus('Submitted');
      router.navigate('/user/waitingResponder');
    } catch (error) {
      console.error('Error during report submission:', error);
      setStatus('Error');
    }
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
        <ScrollView style={styles.reportContainer} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.label}>Upload Photos/Videos</Text>

            <View style={styles.media}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                <SLI name="cloud-upload" size={40} color="#0B0C63" />
              </TouchableOpacity>
              <ScrollView horizontal style={styles.mediaGallery}>
                {mediaFiles.map((file, index) => (
                  <View key={index} style={styles.mediaPreview}>
                    <Image source={{ uri: file.uri }} style={styles.mediaImage} />
                    <TouchableOpacity
                      onPress={() => handleRemoveMedia(index)}
                      style={styles.removeMediaButton}
                    >
                      <MI name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
          <Pressable
            style={styles.button}
            disabled={status === 'Submitting' || status === 'Uploading'}
            onPress={handleSubmit} // Use the new function
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
    bottom: -300,
    right: 0,
    padding: 5,
    backgroundColor: '#0C0C63',
    maxHeight: 300,
    height: 300,
    zIndex: 1000,
    borderRadius: 10,
    overflow: 'scroll',
    gap: 10,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 15,
    height: 15,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
    marginVertical: 60,
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
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  removeImageButton: {},
  changeImageButton: {},
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 16, marginBottom: 5 },
  media: {
    gap: 5,
    marginVertical: 10,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    height: '100%',
  },
  mediaButton: { alignSelf: 'center', marginBottom: 10 },
  mediaGallery: { flexDirection: 'row' },
  mediaPreview: { marginRight: 10, position: 'relative' },
  mediaImage: { width: 100, height: 100, borderRadius: 10 },
  removeMediaButton: { position: 'absolute', top: 5, right: 5, backgroundColor: '#000', padding: 5 },
});
