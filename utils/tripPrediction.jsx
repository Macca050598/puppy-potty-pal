import { getDogToiletEvents, getDog, updateDog, getDogEatingEvents } from '../lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIME_BUCKETS = 24;
const MAX_DAYS_TO_CONSIDER = 7;
const MIN_DAYS_TO_CONSIDER = 2;
const MIN_TRIPS_FOR_PREDICTION = 5;
const MAX_TRIPS_TO_CONSIDER = 20;
const DECAY_CONSTANT = 0.1;
const MAX_PREDICTION_HOURS = 24;
const MEAL_IMPACT_DURATION = 6 * 60 * 60 * 1000;
const MEAL_IMPACT_FACTOR = 0.5;
const WEE_POO_RATIO = 3;
const PREDICTION_CACHE_DURATION = 5 * 60 * 1000;
const EXPECTED_TRIPS_PER_DAY = { wee: 5, poo: 2 };

const getWeightFactor = (weight) => {
  if (weight <= 10) return 0.8;
  if (weight <= 25) return 1.0;
  if (weight <= 40) return 1.2;
  return 1.3;
};

const getAgeFactor = (birthdate) => {
  const ageInMonths = (new Date() - new Date(birthdate)) / (30 * 24 * 60 * 60 * 1000);
  if (ageInMonths < 3) return 0.5;
  if (ageInMonths < 6) return 0.7;
  if (ageInMonths < 12) return 0.9;
  return 1;
};

const getMinTimeBetweenTrips = (birthdate, tripType) => {
  const ageInMonths = (new Date() - new Date(birthdate)) / (30 * 24 * 60 * 60 * 1000);
  const baseTime = ageInMonths < 3 ? 15 : ageInMonths < 6 ? 30 : ageInMonths < 12 ? 60 : 90;
  return (tripType === 'wee' ? baseTime : baseTime * WEE_POO_RATIO) * 60 * 1000;
};

const adjustForTimeOfDay = (prediction, relevantTrips) => {
  const hour = prediction.getHours();
  const tripsAtThisHour = relevantTrips.filter(trip => new Date(trip.timestamp).getHours() === hour).length;
  const adjustmentFactor = 1 + (tripsAtThisHour / relevantTrips.length);
  return new Date(prediction.getTime() * adjustmentFactor);
};

const adjustForMeals = (prediction, recentMeals, now) => {
  let adjustedPrediction = new Date(prediction);
  
  recentMeals.forEach(meal => {
    const mealTime = new Date(meal.timestamp);
    const timeSinceMeal = now - mealTime;
    
    if (timeSinceMeal > 0 && timeSinceMeal <= MEAL_IMPACT_DURATION) {
      const impactFactor = 1 - (timeSinceMeal / MEAL_IMPACT_DURATION);
      const adjustment = (prediction - now) * MEAL_IMPACT_FACTOR * impactFactor;
      adjustedPrediction = new Date(adjustedPrediction.getTime() - adjustment);
    }
  });

  return adjustedPrediction;
};

const getAdaptiveTimeWindow = (trips, tripType) => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tripsLastDay = trips.filter(trip => new Date(trip.timestamp) > oneDayAgo).length;
  const expectedTrips = EXPECTED_TRIPS_PER_DAY[tripType];
  
  if (tripsLastDay >= expectedTrips) {
    return Math.max(MIN_DAYS_TO_CONSIDER, Math.min(MAX_DAYS_TO_CONSIDER, tripsLastDay / expectedTrips));
  } else {
    return MAX_DAYS_TO_CONSIDER;
  }
};

const checkForMissedLogs = (trips, tripType) => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tripsYesterday = trips.filter(trip => {
    const tripDate = new Date(trip.timestamp);
    return tripDate > yesterday && tripDate < now;
  }).length;

  const expectedTrips = EXPECTED_TRIPS_PER_DAY[tripType];
  if (tripsYesterday < expectedTrips / 2) {
    return {
      missed: true,
      message: `It looks like you may have missed logging some ${tripType} trips yesterday. The prediction confidence may be lower than usual.`
    };
  }
  return { missed: false };
};

const predictNextTrip = async (dogId, tripType) => {
  try {
    const predictionEnabled = await AsyncStorage.getItem(`${tripType}PredictionEnabled`);
    if (predictionEnabled === 'false') {
      console.log(`${tripType} prediction alerts are disabled`);
      return { nextPredicted: null, lastTrip: null, confidenceLevel: 0, error: `${tripType} prediction alerts are disabled` };
    }

    const now = new Date();
    
    const cachedPrediction = await AsyncStorage.getItem(`${dogId}_${tripType}_prediction`);
    if (cachedPrediction) {
      const { prediction, timestamp } = JSON.parse(cachedPrediction);
      const parsedPrediction = JSON.parse(prediction);
      const cacheAge = now - new Date(timestamp);
      const predictedTime = new Date(parsedPrediction.nextPredicted);
      
      if (cacheAge < PREDICTION_CACHE_DURATION && predictedTime > now) {
        console.log(`Using cached prediction for ${dogId} ${tripType}`);
        return parsedPrediction;
      }
    }

    const dog = await getDog(dogId);
    
    const [recentTrips, recentEatingEvents] = await Promise.all([
      getDogToiletEvents(dogId, 50, tripType),
      getDogEatingEvents(dogId, 50)
    ]);

    if (recentTrips.length < MIN_TRIPS_FOR_PREDICTION) {
      return { nextPredicted: null, lastTrip: null, confidenceLevel: 0, error: `Not enough data to predict next ${tripType} trip` };
    }

    const adaptiveTimeWindow = getAdaptiveTimeWindow(recentTrips, tripType);
    const relevantTrips = recentTrips
      .slice(0, MAX_TRIPS_TO_CONSIDER)
      .filter(trip => (now - new Date(trip.timestamp)) / (1000 * 60 * 60 * 24) <= adaptiveTimeWindow)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const relevantEatingEvents = recentEatingEvents
      .filter(event => (now - new Date(event.timestamp)) / (1000 * 60 * 60 * 24) <= adaptiveTimeWindow)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (relevantTrips.length < MIN_TRIPS_FOR_PREDICTION) {
      return { nextPredicted: null, lastTrip: null, confidenceLevel: 0, error: `Not enough recent data to predict next ${tripType} trip` };
    }

    const calculateWeight = (timestamp) => {
      const timeElapsed = now - new Date(timestamp);
      return Math.exp(-DECAY_CONSTANT * (timeElapsed / (1000 * 60 * 60)));
    };

    let weightedTotalTimeBetween = 0;
    let weightSum = 0;

    for (let i = 1; i < relevantTrips.length; i++) {
      const timeDiff = new Date(relevantTrips[i - 1].timestamp) - new Date(relevantTrips[i].timestamp);
      const weight = calculateWeight(relevantTrips[i].timestamp);
      weightedTotalTimeBetween += timeDiff * weight;
      weightSum += weight;
    }
    
    let avgTimeBetween = weightedTotalTimeBetween / weightSum;

    const weightFactor = getWeightFactor(dog.weight);
    const personalWeightFactor = dog.personalWeightFactor || 1;
    const ageFactor = getAgeFactor(dog.birthdate);

    avgTimeBetween *= weightFactor * personalWeightFactor * ageFactor;

    if (tripType === 'poo') {
      avgTimeBetween *= WEE_POO_RATIO;
    }

    const lastTrip = new Date(relevantTrips[0].timestamp);
    let nextPredicted = new Date(Math.max(now.getTime(), lastTrip.getTime()) + avgTimeBetween);

    const maxFutureDate = new Date(now.getTime() + MAX_PREDICTION_HOURS * 60 * 60 * 1000);
    if (nextPredicted > maxFutureDate) {
      nextPredicted = new Date(now.getTime() + avgTimeBetween);
    }

    nextPredicted = adjustForTimeOfDay(nextPredicted, relevantTrips);

    if (tripType === 'poo') {
      nextPredicted = adjustForMeals(nextPredicted, relevantEatingEvents, now);
    }

    const minTimeBetweenTrips = getMinTimeBetweenTrips(dog.birthdate, tripType);

    while (nextPredicted <= now || (nextPredicted - now) < minTimeBetweenTrips) {
      nextPredicted = new Date(nextPredicted.getTime() + avgTimeBetween);
    }

    if (nextPredicted > maxFutureDate) {
      nextPredicted = maxFutureDate;
    }

    const confidenceLevel = calculateConfidence(relevantTrips, avgTimeBetween);
    const missedLogsCheck = checkForMissedLogs(recentTrips, tripType);

    const result = { 
      nextPredicted: nextPredicted.toISOString(), 
      lastTrip: lastTrip.toISOString(),
      confidenceLevel,
      adaptiveTimeWindow,
      missedLogsWarning: missedLogsCheck.missed ? missedLogsCheck.message : null,
      error: null 
    };

    await AsyncStorage.setItem(`${dogId}_${tripType}_prediction`, JSON.stringify({
      prediction: JSON.stringify(result),
      timestamp: now.toISOString()
    }));

    // console.log('Prediction details:', {
    //   dogId,
    //   tripType,
    //   lastTrip: lastTrip.toISOString(),
    //   nextPredicted: nextPredicted.toISOString(),
    //   confidenceLevel,
    //   adaptiveTimeWindow,
    //   relevantTripsCount: relevantTrips.length,
    //   relevantEatingEventsCount: relevantEatingEvents.length,
    //   missedLogsWarning: result.missedLogsWarning
    // });

    return result;

  } catch (error) {
    console.error(`Error predicting next ${tripType} trip:`, error);
    return { nextPredicted: null, lastTrip: null, confidenceLevel: 0, error: `Error predicting next ${tripType} trip` };
  }
};

const calculateConfidence = (trips, avgTimeBetween) => {
  if (trips.length < MIN_TRIPS_FOR_PREDICTION) return 0;

  const timeDiffs = trips.slice(0, -1).map((trip, index) => 
    Math.abs(new Date(trip.timestamp) - new Date(trips[index + 1].timestamp) - avgTimeBetween)
  );

  const avgDeviation = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
  const consistencyScore = Math.max(0, 100 - (avgDeviation / avgTimeBetween) * 100);

  const dataAmountScore = Math.min(100, (trips.length / MAX_TRIPS_TO_CONSIDER) * 100);

  return (consistencyScore * 0.7 + dataAmountScore * 0.3);
};

export const predictNextWeeTrip = (dogId) => predictNextTrip(dogId, 'wee');
export const predictNextPooTrip = (dogId) => predictNextTrip(dogId, 'poo');

export const updatePredictionFactors = async (dogId, predictedTime, actualTime, isCorrect) => {
  const dog = await getDog(dogId);
  const timeDifference = Math.abs(actualTime - predictedTime);
  const maxAllowedDifference = 30 * 60 * 1000;  // 30 minutes in milliseconds

  if (!isCorrect || timeDifference > maxAllowedDifference) {
    const adjustmentFactor = isCorrect ? 0.05 : 0.1; // Smaller adjustment if correct but outside window
    if (actualTime < predictedTime) {
      dog.personalWeightFactor = Math.max(0.5, (dog.personalWeightFactor || 1) - adjustmentFactor);
    } else {
      dog.personalWeightFactor = Math.min(1.5, (dog.personalWeightFactor || 1) + adjustmentFactor);
    }
    await updateDog(dogId, { personalWeightFactor: dog.personalWeightFactor });
  }

  // Clear the cached prediction after updating factors
  await AsyncStorage.removeItem(`${dogId}_wee_prediction`);
  await AsyncStorage.removeItem(`${dogId}_poo_prediction`);

  console.log('Prediction factor update:', {
    dogId,
    predictedTime: new Date(predictedTime).toISOString(),
    actualTime: new Date(actualTime).toISOString(),
    isCorrect,
    newPersonalWeightFactor: dog.personalWeightFactor
  });
};