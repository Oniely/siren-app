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
          <TouchableOpacity style={styles.box} onPress={() => router.push('/')}>
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
          </TouchableOpacity>

          <View style={styles.bigCircleContainer}>
            <TouchableOpacity style={styles.bigCircle} onPress={() => router.push('/')}>
              <Image source={require('@/assets/images/panic_button.png')} style={styles.panicButton} />
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
  bigCircleContainer: {
    width: '70%',
    maxWidth: 300,
    aspectRatio: 1,
    position: 'absolute',
  },
  bigCircle: {
    flex: 1,
    borderRadius: 1000,
    backgroundColor: '#45D2F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicButton: {
    resizeMode: 'stretch',
    height: '95%',
    width: '90%',
    marginHorizontal: 'auto',
  },
});

export default Dashboard;
