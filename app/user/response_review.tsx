import { View, Text, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ResponseReview() {
  const [defaultRating, setDefaultRating] = useState(0);
  const [maxRating, setMaxRating] = useState([1, 2, 3, 4, 5]);
  const [comment, setComment] = useState('');

  const starImgFilled = <AntDesign name="star" size={40} color="#1f86e8" />;
  const starImgCorner = <AntDesign name="staro" size={40} color="#1074d2" />;

  function handleSubmit() {
    if (defaultRating === 0) {
      alert('Select a rating');
      return;
    }
    console.log('User rating: ', defaultRating);
    console.log('User comment: ', comment);
  }

  const CustomRatingBar = () => {
    return (
      <View style={styles.customRatingBarStyle}>
        {maxRating.map((item) => {
          return (
            <TouchableOpacity activeOpacity={0.7} key={item} onPress={() => setDefaultRating(item)}>
              {item <= defaultRating ? starImgFilled : starImgCorner}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headText} numberOfLines={1}>
        Response Review
      </Text>
      <View style={styles.responderInfo}>
        <Image source={require('@/assets/images/profile.png')} style={styles.responderImage} />
        <Text style={styles.responderName}>RubleRuble</Text>
        <Text style={styles.responderContact}>9892-28732-222</Text>
      </View>
      <View style={styles.responseContainer}>
        <Text style={styles.responseFeedback}>Response Feedback?</Text>
        <CustomRatingBar />
      </View>
      <KeyboardAvoidingView
        style={{ width: '100%', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={1000}
      >
        <View style={styles.commentContainer}>
          <TextInput
            placeholder="Add comment here (optional)"
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={styles.commentDesc}>Anything you want to comment?</Text>
          <Text style={styles.footerDesc}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec urna vel sapien aliquam
            posuere.
          </Text>
          <TouchableOpacity style={styles.submitButton} activeOpacity={0.7} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#faf9f6',
    paddingVertical: '30@s',
    gap: '45@s',
  },
  headText: {
    fontSize: '28@vs',
    fontFamily: 'BeVietnamProRegular',
    letterSpacing: 0,
    color: '#0b0c63',
  },
  responderInfo: {
    alignItems: 'center',
  },
  responderImage: {
    resizeMode: 'cover',
    width: '80@s',
    height: '80@s',
    borderWidth: 2,
    borderColor: '#b9b9b6',
    borderRadius: 999,
  },
  responderName: {
    fontSize: '20@s',
    fontFamily: 'BeVietnamProBold',
    color: '#082c49',
  },
  responderContact: {
    fontSize: '14@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#b9b9b6',
  },
  responseContainer: {
    alignItems: 'center',
  },
  responseFeedback: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#5f7687',
  },
  customRatingBarStyle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: '15@s',
    gap: '5@s',
  },
  commentContainer: {
    width: '100%',
    maxWidth: '260@s',
    alignItems: 'center',
    gap: '5@s',
  },
  commentInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
    padding: '5@s',
    color: '#343434',
    fontSize: '14@s',
    fontFamily: 'BeVietnamProRegular',
  },
  commentDesc: {
    fontSize: '13@s',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#61788b',
  },
  footerDesc: {
    marginTop: '20@s',
    fontSize: '14@s',
    fontFamily: 'BeVietnamProThin',
    color: '#aebac3',
    textAlign: 'justify',
  },
  submitButton: {
    width: '100%',
    marginTop: '60@s',
    paddingVertical: '10@s',
    backgroundColor: '#0c0c63',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10@s',
  },
  submitText: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'BeVietnamProBold',
    fontSize: '14@s',
  },
});
