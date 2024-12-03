import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '@/components/Header';
import StyledContainer from '@/components/StyledContainer';
import { Link, useRouter } from 'expo-router';
import { ScaledSheet } from 'react-native-size-matters';

MCI.loadFont();

const Dashboard = () => {
  const router = useRouter();

  return (
    <StyledContainer>
      <Header />
      <View style={styles.indexTopBar}>
        <View style={styles.topBarLeft}>
          <Image source={require('@/assets/images/profile.png')} style={styles.topBarImage} />
          <View>
            <Text style={styles.topBarName}>Elizabeth</Text>
            <Link href={'/user/profile'}>
              <Text style={styles.topBarLink}>See profile</Text>
            </Link>
          </View>
        </View>
        <View>
          <View>
            <View style={styles.location}>
              <Text style={[styles.topBarName, { width: 85 }]} numberOfLines={1}>
                User's Location goes here
              </Text>
              <Image source={require('@/assets/images/location.png')} style={styles.locationIcon} />
            </View>
            <Link href={'/user/map'}>
              <Text style={styles.topBarLink}>Show your location</Text>
            </Link>
          </View>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <Text style={styles.indexText}>Emergency help needed?</Text>
          <View style={styles.bigCircleContainer}>
            <TouchableOpacity onPress={() => router.push('/user/emergency_call')}>
              <Image source={require('@/assets/images/index_logo.png')} style={styles.panicButton} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </StyledContainer>
  );
};

const styles = ScaledSheet.create({
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
    fontSize: '40@s',
    textAlign: 'center',
    color: '#343434',
    fontFamily: 'BeVietnamProBold',
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
  indexTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@s',
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
    color: '#999898',
  },
  topBarLink: {
    fontFamily: 'BeVietnamProRegular',
    fontSize: '12@s',
    color: '#3998ff',
  },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationIcon: {
    width: 10,
    height: 15,
  },
});

export default Dashboard;
