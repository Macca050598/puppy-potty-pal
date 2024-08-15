import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { predictNextTrip } from '../utils/tripPrediction';

const NextTripPrediction = ({ selectedDog, colors }) => {
  const [predictedInterval, setPredictedInterval] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [lastTripTime, setLastTripTime] = useState(null);

  const updatePrediction = useCallback(async () => {
    if (selectedDog) {
      try {
        const { interval, lastTrip } = await predictNextTrip(selectedDog.$id);
        if (interval) {
          setPredictedInterval(interval);
          setLastTripTime(lastTrip);
          setPredictionError(null);
        } else {
          setPredictedInterval(null);
          setLastTripTime(null);
          setPredictionError("Not enough data to predict next trip yet.");
        }
      } catch (error) {
        console.error('Failed to predict next trip:', error);
        setPredictedInterval(null);
        setLastTripTime(null);
        setPredictionError("Error predicting next trip. Please try again.");
      }
    } else {
      setPredictedInterval(null);
      setLastTripTime(null);
      setPredictionError(null);
    }
  }, [selectedDog]);

  useEffect(() => {
    updatePrediction();
  }, [updatePrediction]);

  if (!selectedDog) {
    return null;
  }

  const getNextTripTime = () => {
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
    const seconds = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const nextTripTime = getNextTripTime();

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
      <Text style={styles.predictionTitle}>Next Predicted Toilet Trip:</Text>
      {nextTripTime ? (
        <Text style={styles.predictionText}>
          {selectedDog.name} might need to go out at {formatPrediction(nextTripTime)}
        </Text>
      ) : (
        <Text style={styles.predictionError}>
          {predictionError || `Unable to predict ${selectedDog.name}'s next trip.`}
        </Text>
      )}
    </View>
  );
};

export default NextTripPrediction;