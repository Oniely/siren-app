import { View, Text } from 'react-native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';
import AdminStyledContainer from '@/components/admin/AdminStyledContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import { Bar, CartesianChart } from 'victory-native';

export default function Analytics() {
  const data = [
    { x: 'Vehicle Collisions', y: 4 },
    { x: 'Fire Incidents', y: 2 },
    { x: 'Medical Emergencies', y: 6 },
    { x: 'Natural Disasters', y: 8 },
    { x: 'Hazardous Spills', y: 10 },
  ];

  return (
    <AdminStyledContainer>
      <AdminHeader bg="#e6e6e6" />
      <View style={styles.container}>
        <View>
          <Text style={styles.headerText}>Analytic Reports</Text>
          <Text style={styles.headerDesc} numberOfLines={1}>
            Lorem ipsum dolor sit amet...
          </Text>
        </View>
        <View>
          <Text>Graph goes here...</Text>
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
    marginTop: '50@s',
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
});
