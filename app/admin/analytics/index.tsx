import { View, Text, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { scale, ScaledSheet } from 'react-native-size-matters';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { BarChart } from 'react-native-gifted-charts';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';

export default function Analytics() {
  const [reports, setReports] = useState<any>(null);

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
            const category = report.category;

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
          <View style={styles.chartContainer}>
            <Text style={styles.chartHeaderText}>Incident Type Analysis</Text>
            <BarChart
              data={reports || []}
              autoShiftLabels
              backgroundColor="#fcfcfd"
              barWidth={40}
              dashGap={0}
              height={scale(200)}
              width={scale(290)}
              minHeight={3}
              barBorderTopLeftRadius={6}
              barBorderTopRightRadius={6}
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
  barChart: {},
});
