import { getDogToiletEvents } from '../lib/appwrite';
import { scheduleNotification } from './notifications';

const TIME_BLOCKS = {
  MORNING: 0,
  AFTERNOON: 1,
  EVENING: 2,
  NIGHT: 3
};

const getTimeBlock = (hour) => {
  if (hour >= 5 && hour < 12) return TIME_BLOCKS.MORNING;
  if (hour >= 12 && hour < 17) return TIME_BLOCKS.AFTERNOON;
  if (hour >= 17 && hour < 22) return TIME_BLOCKS.EVENING;
  return TIME_BLOCKS.NIGHT;
};

export const predictNextTrip = async (dogId) => {
  try {
    const recentTrips = await getDogToiletEvents(dogId, 10);

    if (recentTrips.length < 2) {
      console.log("Not enough data to predict next trip");
      return { interval: null, lastTrip: null };
    }

    // Calculate average time between trips
    let totalTimeBetween = 0;
    for (let i = 1; i < recentTrips.length; i++) {
      const timeDiff = new Date(recentTrips[i-1].timestamp) - new Date(recentTrips[i].timestamp);
      totalTimeBetween += timeDiff;
    }
    const avgTimeBetween = totalTimeBetween / (recentTrips.length - 1);

    return {
      interval: avgTimeBetween,
      lastTrip: recentTrips[0].timestamp
    };

  } catch (error) {
    console.error("Error predicting next trip interval:", error);
    return { interval: null, lastTrip: null };
  }
};