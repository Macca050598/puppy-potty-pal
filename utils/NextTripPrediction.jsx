import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { predictNextWeeTrip, predictNextPooTrip } from '../utils/tripPrediction';

const NextTripPrediction = ({ selectedDog, colors }) => {
  const [predictedWeeInterval, setPredictedWeeInterval] = useState(null);
  const [predictedPooInterval, setPredictedPooInterval] = useState(null);
  const [weePredictionError, setWeePredictionError] = useState(null);
  const [pooPredictionError, setPooPredictionError] = useState(null);
  const [lastWeeTripTime, setLastWeeTripTime] = useState(null);
  const [lastPooTripTime, setLastPooTripTime] = useState(null);

  const updatePredictions = useCallback(async () => {
    if (selectedDog) {
      try {
        // Predict next wee trip
        const { interval: weeInterval, lastTrip: lastWeeTrip } = await predictNextWeeTrip(selectedDog.$id);
        if (weeInterval) {
          setPredictedWeeInterval(weeInterval);
          setLastWeeTripTime(lastWeeTrip);
          setWeePredictionError(null);
        } else {
          setPredictedWeeInterval(null);
          setLastWeeTripTime(null);
          setWeePredictionError("Not enough data to predict next wee trip yet.");
        }

        // Predict next poo trip
        const { interval: pooInterval, lastTrip: lastPooTrip } = await predictNextPooTrip(selectedDog.$id);
        if (pooInterval) {
          setPredictedPooInterval(pooInterval);
          setLastPooTripTime(lastPooTrip);
          setPooPredictionError(null);
        } else {
          setPredictedPooInterval(null);
          setLastPooTripTime(null);
          setPooPredictionError("Not enough data to predict next poo trip yet.");
        }
      } catch (error) {
        console.error('Failed to predict next trip:', error);
        setPredictedWeeInterval(null);
        setLastWeeTripTime(null);
        setWeePredictionError("Error predicting next wee trip. Please try again.");

        setPredictedPooInterval(null);
        setLastPooTripTime(null);
        setPooPredictionError("Error predicting next poo trip. Please try again.");
      }
    } else {
      setPredictedWeeInterval(null);
      setLastWeeTripTime(null);
      setWeePredictionError(null);

      setPredictedPooInterval(null);
      setLastPooTripTime(null);
      setPooPredictionError(null);
    }
  }, [selectedDog]);

  useEffect(() => {
    updatePredictions();
  }, [updatePredictions]);

  if (!selectedDog) {
    return null;
  }

  const getNextTripTime = (predictedInterval, lastTripTime) => {
    if (!predictedInterval || !lastTripTime) return null;
    const now = new Date();
    const lastTrip = new Date(lastTripTime);
    let nextTrip = new Date(lastTrip.getTime() + predictedInterval);
    while (nextTrip <= now) {
      nextTrip = new Date(nextTrip.getTime() + predictedInterval);
    }
    return nextTrip;
  };

  const formatPrediction = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const nextWeeTripTime = getNextTripTime(predictedWeeInterval, lastWeeTripTime);
  const nextPooTripTime = getNextTripTime(predictedPooInterval, lastPooTripTime);

  const styles = StyleSheet.create({
    predictionContainer: {
      backgroundColor: `${colors.secondary}40`,
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    predictionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    predictionText: {
      fontSize: 14,
      color: colors.primary,
    },
    predictionError: {
      fontSize: 14,
      color: colors.tint,
    },
  });

  return (
    <View style={styles.predictionContainer}>
      <Text style={styles.predictionTitle}>Next Predicted Toilet Trips:</Text>

      {/* Display the predicted next wee trip */}
      {nextWeeTripTime ? (
        <Text style={styles.predictionText}>
          {selectedDog.name} might need to wee at {formatPrediction(nextWeeTripTime)}
        </Text>
      ) : (
        <Text style={styles.predictionError}>
          {weePredictionError || `Unable to predict ${selectedDog.name}'s next wee trip.`}
        </Text>
      )}

      {/* Display the predicted next poo trip */}
      {nextPooTripTime ? (
        <Text style={styles.predictionText}>
          {selectedDog.name} might need to poo at {formatPrediction(nextPooTripTime)}
        </Text>
      ) : (
        <Text style={styles.predictionError}>
          {pooPredictionError || `Unable to predict ${selectedDog.name}'s next poo trip.`}
        </Text>
      )}
    </View>
  );
};

export default NextTripPrediction;
