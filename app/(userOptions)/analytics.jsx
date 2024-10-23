import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
const Analytics = () => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  // Sample data for charts
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [3, 4, 2, 5, 3, 4, 3],
      }
    ]
  };

  const barData = {
    labels: ["Morning", "Afternoon", "Evening", "Night"],
    datasets: [
      {
        data: [8, 6, 7, 2],
      }
    ]
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    chartContainer: {
      marginBottom: 30,
      borderRadius: 8,
      backgroundColor: colors.card,
      padding: 0,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    insightContainer: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: colors.card,
      marginBottom: 20,
    },
    insightText: {
      fontSize: 16,
      color: colors.text,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    overlayText: {
      fontSize: 32,
      color: 'white',
      fontWeight: 'bold',
    },
  });

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Toilet Trip Analytics</Text>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Toilet Trips</Text>
            <LineChart
              data={data}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 8
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.primary,
                },
              }}
              bezier
              style={{
                borderRadius: 8
              }}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Toilet Trips by Time of Day</Text>
            <BarChart
              data={barData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 8
                },
              }}
              style={{
                borderRadius: 8
              }}
            />
          </View>

          <View style={styles.insightContainer}>
            <Text style={styles.insightText}>
              🐕 Your dog is most active in the morning with an average of 8 trips.
            </Text>
          </View>

          <View style={styles.insightContainer}>
            <Text style={styles.insightText}>
              ⏰ On average, your dog needs a toilet trip every 4 hours.
            </Text>
          </View>

          <View style={styles.insightContainer}>
            <Text style={styles.insightText}>
              🌦 Rainy days see a decrease in trips by 30%.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Coming Soon...</Text>
        </View>
        <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>

      </SafeAreaView>
    </AuthenticatedLayout>
    
  );
};

export default Analytics;
