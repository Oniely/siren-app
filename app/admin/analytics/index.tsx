import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { scale, ScaledSheet } from 'react-native-size-matters';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { BarChart } from 'react-native-gifted-charts';
import { get, ref } from 'firebase/database';
import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-gifted-charts';

export default function Analytics() {
  const [reports, setReports] = useState<any>(null);
  const router = useRouter();
  const [activeChart, setActiveChart] = useState<'bar' | 'line'>('bar'); // State to toggle between charts
  const [latestReports, setLatestReports] = useState<any>([]);
  const [incidentCounts, setIncidentCounts] = useState<any>({
    'Road Accidents': 0,
    'Fires and Explosions': 0,
    'Natural Disasters': 0,
  });

  const predefinedCategories = ['Road Accidents', 'Fires and Explosions', 'Natural Disasters'];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRef = ref(db, 'reports');
        const snapshot = await get(reportsRef);

        if (snapshot.exists()) {
          const reportsData = snapshot.val();

          const categoriesCount: any = {};
          const latestReportsByCategory: any = {};

          Object.entries(reportsData).forEach(([key, report]: [string, any]) => {
            const category = report.category || 'Unknown';
            const location = report.location || 'Unknown';
            const timestamp = report.timestamp || Date.now(); // Mock timestamp if not available

            // Update category counts
            if (categoriesCount[category]) {
              categoriesCount[category]++;
            } else {
              categoriesCount[category] = 1;
            }

            // Update latest report for the category
            if (
              !latestReportsByCategory[category] ||
              latestReportsByCategory[category].timestamp < timestamp
            ) {
              latestReportsByCategory[category] = { category, location, timestamp };
            }
          });
          predefinedCategories.forEach((category) => {
            if (!categoriesCount[category]) categoriesCount[category] = 0;
            if (!latestReportsByCategory[category]) {
              latestReportsByCategory[category] = {
                category,
                location: 'No data available',
                timestamp: null,
              };
            }
          });
          const chartData = Object.keys(categoriesCount).map((category) => ({
            value: categoriesCount[category],
            label: category,
            frontColor: '#087bb8',
          }));

          setReports(chartData);
          setIncidentCounts(categoriesCount);
          setLatestReports(Object.values(latestReportsByCategory).filter(Boolean));
        } else {
          console.log('No reports data available');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);
  const translateTimestamp = (timestamp) => {
    const date = new Date(timestamp); // Convert the timestamp to a Date object
    return date.toLocaleString(); // Formats to a readable local date and time
  };
  return (
    <AdminStyledContainer>
      <AdminHeader bg="#e6e6e6" />
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View>
            <Text style={styles.headerText}>Analytic Reports</Text>
            <Text style={styles.headerDesc} numberOfLines={1}>
              Data and numbers of accidents
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => setActiveChart('bar')} // Switch to bar chart
            >
              <Text style={[styles.button, activeChart === 'bar' && styles.active]}>Incident Type</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveChart('line')} // Switch to line chart
              activeOpacity={0.7}
            >
              <Text style={[styles.button, activeChart === 'line' && styles.active]}>Average Response</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            {activeChart === 'bar' ? (
              <>
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
              </>
            ) : (
              <>
                <Text style={styles.chartHeaderText}>Average Response Analysis</Text>
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
              </>
            )}
          </View>

          {/* Map Data */}
          <View style={styles.mapDataContainer}>
            <Text style={styles.textHeader}>Map Data {'(Incident Counts and Latest)'}</Text>
            <View style={styles.dataContainer}>
              {predefinedCategories.map((category) => (
                <View key={category} style={styles.dataBox}>
                  <Text style={styles.boxName}>{category}</Text>
                  <Text style={styles.boxData}>{incidentCounts[category]} incidents</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Latest Reports */}
          <View style={styles.latestReports}>
            {latestReports.map((report: any, index: number) => (
              <View key={index} style={styles.latestReportBox}>
                <Text style={styles.boxName}>{report.category}</Text>
                <Text style={styles.boxData}>
                  Time: {report.timestamp ? translateTimestamp(report.timestamp) : 'No data available'}
                </Text>
              </View>
            ))}
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
    textAlign: 'center',
  },
  boxData: {
    fontSize: '11@s',
    fontFamily: 'BeVietnamProRegular',
    textAlign: 'center',
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
  latestReportsContainer: {
    marginTop: '30@s',
  },
  latestReports: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '10@s',
  },
  latestReportBox: {
    width: '96@s',
    height: '85@s',
    borderWidth: 1,
    borderColor: '#b0adad',
    borderRadius: '10@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
