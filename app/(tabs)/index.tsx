import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import FS from 'react-native-vector-icons/FontAwesome';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '@/components/Header';
import StyledContainer from '@/components/StyledContainer';
import { useRouter } from 'expo-router';

MCI.loadFont();

const Dashboard = () => {
  const router = useRouter();

  return (
    <StyledContainer>
      <Header />
      <View style={styles.container}>
        <View style={styles.wrapper}>
          {/* <TouchableOpacity style={styles.box} onPress={() => router.push('/')}>
            <Text style={styles.boxText}>Report Emergency</Text>
            <MCI size={50} name="alert-circle" color={'#D7F1F7'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.box} onPress={() => router.push('/')}>
            <Text style={styles.boxText}>View{'\n'}Alerts</Text>
            <MCI size={50} name="monitor-eye" color={'#D7F1F7'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.box,
              {
                justifyContent: 'flex-end',
              },
            ]}
          >
            <MCI size={50} name="phone-ring" color={'#D7F1F7'} />
            <Text style={styles.boxText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.box,
              {
                justifyContent: 'flex-end',
              },
            ]}
            onPress={() => router.push('/')}
          >
            <FS size={50} name="telegram" color={'#D7F1F7'} />
            <Text style={styles.boxText}>Emergency Text</Text>
          </TouchableOpacity> */}
          <Text style={styles.indexText}>Emergency help needed?</Text>
          <View style={styles.bigCircleContainer}>
            <TouchableOpacity onPress={() => router.push('/report_emergency')}>
              <Image source={require('@/assets/images/index_logo.png')} style={styles.panicButton} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </StyledContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '80%',
    position: 'relative',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '48%',
    height: '50%',
    maxWidth: 400,
    borderRadius: 50,
    backgroundColor: '#087BB8',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  boxText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
  },
  indexText: {
    fontSize: 50,
    textAlign: 'center',
    color: '#343434',
    fontWeight: 'bold',
  },
  bigCircleContainer: {
    width: '100%',
    maxWidth: 500,
    aspectRatio: 1,
    position: 'absolute',
  },

  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
  },
});

export default Dashboard;
