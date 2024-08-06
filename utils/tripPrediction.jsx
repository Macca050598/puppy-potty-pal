import { Alert } from 'react-native';
import { getDogToiletEvents } from '../lib/appwrite';
import { scheduleNotification } from './notifications';

export const predictNextTrip = async (dogId) => {
  try {
    const recentTrips = await getDogToiletEvents(dogId, 10);

    if (recentTrips.length < 2) {
      console.log("Not enough data to predict next trip");
      return null;
    }

    const timeDiffs = [];
    for (let i = 1; i < recentTrips.length; i++) {
      const diff = new Date(recentTrips[i-1].timestamp) - new Date(recentTrips[i].timestamp);
      timeDiffs.push(diff);
    }

    const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;

    const lastTripTime = new Date(recentTrips[0].timestamp);
    let predictedNextTrip = new Date(lastTripTime.getTime() + avgDiff);

    // If the predicted time is in the past, set it to 5 minutes from now
    const now = new Date();
    if (predictedNextTrip <= now) {
      predictedNextTrip = new Date(now.getTime() + 5 * 60000); // 5 minutes from now
    }

    try {
      await scheduleNotification(dogId, predictedNextTrip);
    } catch (notificationError) {
      console.error("Failed to schedule notification:", notificationError);
      // Continue execution even if notification scheduling fails
    }

    return predictedNextTrip;

  } catch (error) {
    console.error("Error predicting next trip:", error);
    return null;
  }
};