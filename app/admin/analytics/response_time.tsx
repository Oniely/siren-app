import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { scale, ScaledSheet } from 'react-native-size-matters';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { LineChart } from 'react-native-gifted-charts';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';

// NEED REAL DATA
export default function ResponseAnalytics() {
  const [reports, setReports] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRef = ref(db, 'reports');
        const snapshot = await get(reportsRef);

        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const categoriesCount: any = {};

          for (const key in reportsData) {
            const report = reportsData[key];
            const category = report.category || 'Unknown'; // Handle undefined categories

            if (categoriesCount[category]) {
              categoriesCount[category]++;
            } else {
              categoriesCount[category] = 1;
            }
          }

          const chartData = Object.keys(categoriesCount).map((category) => ({
            value: categoriesCount[category],
            label: category,
            frontColor: '#087bb8',
          }));

          setReports(chartData);
        } else {
          console.log('No reports data available');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  return (
    <AdminStyledContainer>
      <AdminHeader bg="#e6e6e6" />
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View>
            <Text style={styles.headerText}>Analytic Reports</Text>
            <Text style={styles.headerDesc} numberOfLines={1}>
              Lorem ipsum dolor sit amet...
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => router.push('/admin/analytics')} activeOpacity={0.7}>
              <Text style={styles.button}>Incident Type</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.95}>
              <Text style={[styles.button, styles.active]}>Average Response</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <Text style={styles.chartHeaderText}>Average Response Time</Text>
            <LineChart
              data={reports || []}
              backgroundColor="#fcfcfd"
              dashGap={0}
              height={scale(200)}
              width={scale(290)}
              noOfSections={5}
              yAxisThickness={0}
              yAxisTextStyle={{ fontSize: 10, color: 'gray' }}
              xAxisLabelTextStyle={{ fontSize: 10, color: 'gray' }}
              spacing={10}
              isAnimated
            />
          </View>
          <View style={styles.mapDataContainer}>
            <Text style={styles.textHeader}>Map Data {'(Incident Locations)'}</Text>
            <View style={styles.dataContainer}>
              <View style={styles.dataBox}>
                <Text style={styles.boxName}>Zone 1</Text>
                <Text style={styles.boxData}>2 incidents</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.boxName}>Zone 2</Text>
                <Text style={styles.boxData}>2 incidents</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.boxName}>Zone 3</Text>
                <Text style={styles.boxData}>2 incidents</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.boxName}>Zone 4</Text>
                <Text style={styles.boxData}>2 incidents</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.boxName}>Zone 5</Text>
                <Text style={styles.boxData}>2 incidents</Text>
              </View>
              <View style={styles.dataBox}>
                <Text style={styles.boxName}>Zone 6</Text>
                <Text style={styles.boxData}>2 incidents</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminStyledContainer>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '20@s',
    paddingVertical: '10@s',
    backgroundColor: '#e6e6e6',
  },
  headerText: {
    fontSize: '24@s',
    fontFamily: 'BeVietnamProBold',
  },
  headerDesc: {
    fontSize: '14@s',
    fontFamily: 'BeVietnamProRegular',
    color: '#343434',
  },
  mapDataContainer: {
    marginTop: '30@s',
  },
  dataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '10@s',
    marginVertical: '20@s',
  },
  dataBox: {
    width: '96@s',
    height: '85@s',
    borderWidth: 1,
    borderColor: '#b0adad',
    borderRadius: '10@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxName: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProMedium',
    color: '#087bb8',
  },
  boxData: {
    fontSize: '11@s',
    fontFamily: 'BeVietnamProRegular',
  },
  textHeader: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#343434',
  },
  chartContainer: {
    backgroundColor: '#fcfcfd',
    borderRadius: '10@s',
    padding: '10@s',
    overflow: 'hidden',
    marginTop: '30@s',
  },
  chartHeaderText: {
    fontSize: '16@s',
    fontFamily: 'BeVietnamProSemiBold',
    color: '#343434',
    marginLeft: '10@s',
    marginBottom: '10@s',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '10@s',
    marginTop: '10@vs',
  },
  button: {
    paddingHorizontal: '10@s',
    paddingVertical: '5@s',
    borderRadius: '10@s',
    fontSize: '12@ms',
    fontFamily: 'BeVietnamProRegular',
    borderWidth: 2,
    borderColor: '#b6b6b7',
  },
  active: {
    borderColor: '#016ea6',
    color: '#016ea6',
  },
});
