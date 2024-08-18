import { scheduleNotification } from './notifications';
import { getDogToiletEvents2 } from '../lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const predictNextWeeTrip = async (dogId) => {
  try {
    const weePredictionEnabled = await AsyncStorage.getItem('weePredictionEnabled');
    if (weePredictionEnabled === 'false') {
      console.log("Wee prediction alerts are disabled");
      return { interval: null, lastTrip: null };
    }

    // Fetch only "wee" events
    const recentTrips = await getDogToiletEvents2(dogId, 10, "wee");

    if (recentTrips.length < 2) {
      console.log("Not enough data to predict next wee trip");
      return { interval: null, lastTrip: null };
    }

    // Calculate average time between trips
    let totalTimeBetween = 0;
    for (let i = 1; i < recentTrips.length; i++) {
      const timeDiff = new Date(recentTrips[i - 1].timestamp) - new Date(recentTrips[i].timestamp);
      totalTimeBetween += timeDiff;
    }
    const avgTimeBetween = totalTimeBetween / (recentTrips.length - 1);

    return {
      interval: avgTimeBetween,
      lastTrip: recentTrips[0].timestamp
    };

  } catch (error) {
    console.error("Error predicting next wee trip interval:", error);
    return { interval: null, lastTrip: null };
  }
};

export const predictNextPooTrip = async (dogId) => {
  try {
    const pooPredictionEnabled = await AsyncStorage.getItem('pooPredictionEnabled');
    if (pooPredictionEnabled === 'false') {
      console.log("Poo prediction alerts are disabled");
      return { interval: null, lastTrip: null };
    }

    // Fetch only "poo" events
    const recentTrips = await getDogToiletEvents2(dogId, 10, "poo");

    if (recentTrips.length < 2) {
      console.log("Not enough data to predict next poo trip");
      return { interval: null, lastTrip: null };
    }

    // Calculate average time between trips
    let totalTimeBetween = 0;
    for (let i = 1; i < recentTrips.length; i++) {
      const timeDiff = new Date(recentTrips[i - 1].timestamp) - new Date(recentTrips[i].timestamp);
      totalTimeBetween += timeDiff;
    }
    const avgTimeBetween = totalTimeBetween / (recentTrips.length - 1);

    return {
      interval: avgTimeBetween,
      lastTrip: recentTrips[0].timestamp
    };

  } catch (error) {
    console.error("Error predicting next poo trip interval:", error);
    return { interval: null, lastTrip: null };
  }
};