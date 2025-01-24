import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import { useGlobalContext } from '../../context/GlobalProvider';
import { getAllDogsCombinedEvents, getUserAndFamilyDogs } from '../../lib/appwrite';
import * as Animatable from 'react-native-animatable';
import { format } from 'date-fns';
const Analytics = () => {
  const { colors } = useTheme();
  const { user } = useGlobalContext();
  const [selectedDog, setSelectedDog] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const screenWidth = Math.min(Dimensions.get("window").width, 500);

  useEffect(() => {
    loadAnalytics();
  }, [selectedDog]);

  const loadAnalytics = async () => {
    if (!user?.$id) return;
    
    try {
      setIsLoading(true);
      
      // Get user's dogs if no dog is selected
      if (!selectedDog) {
        const dogs = await getUserAndFamilyDogs(user.$id);
        if (dogs.length > 0) {
          setSelectedDog(dogs[0]);
          return; // useEffect will trigger again with selected dog
        }
      }

      // Get events for selected dog
      const events = await getAllDogsCombinedEvents([selectedDog.$id]);
      
      // Process events into analytics data
      const processed = processEventsData(events);
      setAnalyticsData(processed);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processEventsData = (events) => {
    const data = {
      toiletFrequencyByDay: {},
      toiletTypeDistribution: { pee: 0, poo: 0 },
      timeOfDayDistribution: {
        morning: 0,   // 5am - 11am
        afternoon: 0, // 11am - 5pm
        evening: 0,   // 5pm - 11pm
        night: 0      // 11pm - 5am
      },
      mealFrequencyByDay: {}
    };

    events.forEach(event => {
      const date = format(new Date(event.$createdAt), 'yyyy-MM-dd');
      const hour = new Date(event.$createdAt).getHours();

      if (event.type === 'toilet') {
        // Daily toilet frequency
        data.toiletFrequencyByDay[date] = (data.toiletFrequencyByDay[date] || 0) + 1;
        
        // Toilet type distribution
        data.toiletTypeDistribution[event.toiletType]++;
        
        // Time of day distribution
        if (hour >= 5 && hour < 11) data.timeOfDayDistribution.morning++;
        else if (hour >= 11 && hour < 17) data.timeOfDayDistribution.afternoon++;
        else if (hour >= 17 && hour < 23) data.timeOfDayDistribution.evening++;
        else data.timeOfDayDistribution.night++;
      } else if (event.type === 'eating') {
        // Daily meal frequency
        data.mealFrequencyByDay[date] = (data.mealFrequencyByDay[date] || 0) + 1;
      }
    });

    return data;
  };

  const renderCharts = () => {
    return (
      <ScrollView style={styles.chartsContainer}>
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Analytics Overview
          </Text>
          <Image 
            source={require('../../assets/images/analyticsChart.webp')}
            style={styles.chartImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* {isLoading ? (
        <ActivityIndicator size="24" color={colors.primary} />
      ) : ( */}
        <>
          {renderCharts()}
          {/* Coming Soon Overlay */}
          <View style={styles.overlay}>
            <Animatable.View 
              animation="fadeIn" 
              style={styles.comingSoonContainer}
            >
              <Text style={styles.comingSoonText}>Coming Soon</Text>
              <Text style={styles.comingSoonSubtext}>
                Detailed analytics and insights about your dog's daily routine
              </Text>
            </Animatable.View>
          </View>
        </>
      {/* )} */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartsContainer: {
    padding: 20,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartImage: {
    width: '100%',
    height: 600,
    borderRadius: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default Analytics;
