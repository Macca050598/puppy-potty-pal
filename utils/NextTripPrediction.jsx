import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { predictNextTrip } from '../utils/tripPrediction';

const NextTripPrediction = ({ selectedDog }) => {
  const [nextPredictedTrip, setNextPredictedTrip] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  useEffect(() => {
    updatePrediction();
  }, [selectedDog]);

  const updatePrediction = async () => {
    if (selectedDog) {
      try {
        const prediction = await predictNextTrip(selectedDog.$id);
        if (prediction) {
          setNextPredictedTrip(prediction);
          setPredictionError(null);
        } else {
          setNextPredictedTrip(null);
          setPredictionError("Not enough data to predict next trip yet.");
        }
      } catch (error) {
        console.error('Failed to predict next trip:', error);
        setNextPredictedTrip(null);
        setPredictionError("Error predicting next trip. Please try again.");
      }
    } else {
      setNextPredictedTrip(null);
      setPredictionError(null);
    }
  };

  if (!selectedDog) {
    return null;
  }

  return (
    <View style={styles.predictionContainer}>
      <Text style={styles.predictionTitle}>Next Predicted Toilet Trip:</Text>
      {nextPredictedTrip ? (
        <Text style={styles.predictionText}>{new Date(nextPredictedTrip).toLocaleString()}</Text>
      ) : (
        <Text style={styles.predictionError}>{predictionError || "Unable to predict next trip."}</Text>
      )}
    </View>
  );
};

// ... styles remain the same ...


const styles = StyleSheet.create({
  predictionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
  },
  predictionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  predictionText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  predictionError: {
    color: '#FFA500',
    fontSize: 14,
  },
});

export default NextTripPrediction;