import { View, Text, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { db, auth } from '@/firebaseConfig';
import { ref, get, onValue, push, set, update } from 'firebase/database';

export default function ResponseReview() {
  const [defaultRating, setDefaultRating] = useState(0);
  const [maxRating, setMaxRating] = useState([1, 2, 3, 4, 5]);
  const [comment, setComment] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const starImgFilled = <AntDesign name="star" size={40} color="#1f86e8" />;
  const starImgCorner = <AntDesign name="staro" size={40} color="#1074d2" />;

  const fetchProfileData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user ID found');
  
      // Fetch user profile
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        setProfileData(userData);
      } else {
        console.log('No profile data available');
      }
  
      // Fetch user's reports and filter
      const reportsRef = ref(db, `reports`);
      const reportsSnapshot = await get(reportsRef);
  
      if (reportsSnapshot.exists()) {
        const reports = reportsSnapshot.val();
        const userReports = Object.entries(reports).filter(
          ([, reportData]: [string, any]) => reportData.senderId === userId && reportData.status === 'Accepted'
        );
  
        if (userReports.length > 0) {
          // Assuming you want to handle the first matching report
          const [firstReportId] = userReports[0];
          setReportId(firstReportId);
        } else {
          console.log('No accepted reports found for this user.');
        }
      } else {
        console.log('No reports data available');
      }
    } catch (error) {
      console.error('Error fetching profile or reports data:', error);
    }
  };
  
  useEffect(() => {
    fetchProfileData();
  }, []);
  function handleSubmit() {
    if (defaultRating === 0) {
      alert('Select a rating');
      return;
    }
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('User not authenticated');
      return;
    }
    if (!reportId) {
      alert('No report ID found. Cannot submit feedback.');
      return;
    }
    const reportRef = ref(db, `reports/${reportId}`);
    const reviewRef = ref(db, 'review/');
    const newReviewRef = push(reviewRef); // Generate a new review ID
    update(reportRef, { status: 'Reviewed' })
    .then(() => {
        console.log('Report status updated to Reviewed.');

        // Insert the review data
        return set(newReviewRef, {
          senderId: userId,
          reportId: reportId,
          rating: defaultRating,
          comment: comment || '',
        });
      })
      .then(() => {
        console.log('Review submitted successfully!');
        alert('Thank you for your feedback!');
        setDefaultRating(0);
        setComment('');
      })
      .catch((error) => {
        console.error('Error submitting review:', error);
        alert('Something went wrong. Please try again.');
      });
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
  //  useEffect(() => {
  //     fetchProfileData();
  //  });
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headText} numberOfLines={1}>
        Response Review
      </Text>
      <View style={styles.responderInfo}>
        <Image source={require('@/assets/images/profile.png')} style={styles.responderImage} />
        <Text style={styles.responderName}>{profileData?.firstname + ' ' + profileData?.lastname}</Text>
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
