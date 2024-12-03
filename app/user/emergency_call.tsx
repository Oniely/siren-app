import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React from 'react';
import StyledContainer from '@/components/StyledContainer';
import { useRouter } from 'expo-router';

export default function EmergencyCall() {
  const router = useRouter();

  return (
    <StyledContainer bg={'#f0efee'}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Image source={require('@/assets/images/profile.png')} style={styles.profileImage} />
          <View style={styles.profileDesc}>
            <Text style={styles.profileTextName}>Elizabeth Bracken</Text>
            <Text style={styles.profileTextAddr}>CT Mall, Kabankalan City</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.topRight} onPress={() => router.back()}>
          <Image source={require('@/assets/images/close_btn.png')} style={styles.closeBtn} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <Text style={styles.indexText}>Emergency Calling...</Text>
          <Text style={styles.indexDesc}>
            Your contact persons nearby, ambulance/police contacts will see your request for help.
          </Text>
          <View style={styles.bigCircleContainer}>
            <Image source={require('@/assets/images/emergency_call_hero.png')} style={styles.buttonBg} />
            <TouchableOpacity onPress={() => console.log('EMERGENCY CALL')} style={styles.panicButton}>
              <Image
                source={require('@/assets/images/emergency_call_btn.png')}
                style={styles.panicButtonImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarBtn}>
          <Image
            source={require('@/assets/images/microphone.png')}
            style={styles.bottomBarBtnImage}
            alt="Mic"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarBtn}>
          <Image source={require('@/assets/images/plus.png')} style={styles.bottomBarBtnImage} alt="Plus" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarBtn}>
          <Image source={require('@/assets/images/camera.png')} style={styles.bottomBarBtnImage} alt="Cam" />
        </TouchableOpacity>
      </View>
    </StyledContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    width: '90%',
    height: '85%',
    position: 'relative',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  topLeft: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  profileImage: {
    resizeMode: 'cover',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 999,
  },
  profileDesc: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    rowGap: 2,
  },
  profileTextName: {
    color: '#989898',
    fontFamily: 'BeVietnamProBold',
    fontWeight: '700',
  },
  profileTextAddr: {
    fontSize: 12,
    fontFamily: 'BeVietnamProMedium',
  },
  topRight: {
    width: 20,
    height: 20,
  },
  closeBtn: { width: '100%', height: '100%' },
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
    fontSize: 34,
    textAlign: 'center',
    color: '#343434',
    fontFamily: 'BeVietnamProSemiBold',
  },
  indexDesc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#b0adad',
    fontWeight: 'medium',
    fontFamily: 'BeVietnamProRegular',
  },
  bigCircleContainer: {
    width: '100%',
    maxWidth: 600,
    aspectRatio: 1,
    position: 'relative',
  },
  buttonBg: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
    zIndex: 10,
  },
  panicButton: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    alignContent: 'center',
    zIndex: 50,
  },
  panicButtonImage: {
    resizeMode: 'center',
    height: '100%',
    width: '100%',
    marginHorizontal: 'auto',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  bottomBarBtn: {
    width: '20%',
    height: '25%',
  },
  bottomBarBtnImage: {
    resizeMode: 'center',
    width: '100%',
    height: '100%',
  },
});
