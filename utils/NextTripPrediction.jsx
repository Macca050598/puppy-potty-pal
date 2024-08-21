import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { predictNextWeeTrip, predictNextPooTrip, updatePredictionFactors } from '../utils/tripPrediction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PredictionFeedback from '../components/PredictionFeedback';

const NextTripPrediction = ({ selectedDog, colors }) => {
  const [weePrediction, setWeePrediction] = useState(null);
  const [pooPrediction, setPooPrediction] = useState(null);
  const [weePredictionEnabled, setWeePredictionEnabled] = useState(true);
  const [pooPredictionEnabled, setPooPredictionEnabled] = useState(true);
  const [showWeeFeedback, setShowWeeFeedback] = useState(false);
  const [showPooFeedback, setShowPooFeedback] = useState(false);

  const loadPredictionSettings = async () => {
    try {
      const weeEnabled = await AsyncStorage.getItem('weePredictionEnabled');
      const pooEnabled = await AsyncStorage.getItem('pooPredictionEnabled');
      setWeePredictionEnabled(weeEnabled !== 'false');
      setPooPredictionEnabled(pooEnabled !== 'false');
    } catch (error) {
      console.error('Error loading prediction settings:', error);
    }
  };

  const updatePredictions = useCallback(async () => {
    if (!selectedDog) return;

    const now = new Date();

    if (weePredictionEnabled) {
      const weeResult = await predictNextWeeTrip(selectedDog.$id);
      setWeePrediction(weeResult);
    } else {
      setWeePrediction({ nextPredicted: null, lastTrip: null, confidenceLevel: 0, error: "Wee prediction alerts are disabled" });
    }

    if (pooPredictionEnabled) {
      const pooResult = await predictNextPooTrip(selectedDog.$id);
      setPooPrediction(pooResult);
    } else {
      setPooPrediction({ nextPredicted: null, lastTrip: null, confidenceLevel: 0, error: "Poo prediction alerts are disabled" });
    }
  }, [selectedDog, weePredictionEnabled, pooPredictionEnabled]);

  useEffect(() => {
    loadPredictionSettings();
    updatePredictions();
  }, [updatePredictions]);

  // Periodically refresh predictions
  useEffect(() => {
    const interval = setInterval(() => {
      updatePredictions();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [updatePredictions]);

  // Handle feedback and update predictions
  const handleFeedback = useCallback(async (tripType, isCorrect) => {
    if (!selectedDog) return;

    const prediction = tripType === 'wee' ? weePrediction : pooPrediction;
    if (!prediction || !prediction.nextPredicted) return;

    const predictedTime = new Date(prediction.nextPredicted);
    const actualTime = new Date();

    await updatePredictionFactors(selectedDog.$id, predictedTime, actualTime, isCorrect);

    if (tripType === 'wee') {
      setShowWeeFeedback(false);
    } else {
      setShowPooFeedback(false);
    }

    updatePredictions();
  }, [selectedDog, weePrediction, pooPrediction, updatePredictions]);

  useEffect(() => {
    const checkFeedbackEligibility = () => {
      const now = new Date();
      if (weePrediction && weePrediction.nextPredicted) {
        const weeTime = new Date(weePrediction.nextPredicted);
        setShowWeeFeedback(now >= weeTime && now <= new Date(weeTime.getTime() + 30 * 60000)); // 30 minutes window
      }
      if (pooPrediction && pooPrediction.nextPredicted) {
        const pooTime = new Date(pooPrediction.nextPredicted);
        setShowPooFeedback(now >= pooTime && now <= new Date(pooTime.getTime() + 30 * 60000)); // 30 minutes window
      }
    };

    checkFeedbackEligibility(); // Check immediately
    const interval = setInterval(checkFeedbackEligibility, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [weePrediction, pooPrediction]);

  if (!selectedDog) {
    return null;
  }

  const formatPrediction = (dateString) => {
    if (!dateString) return 'Unable to predict';
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    if (date < now) {
      return 'Past prediction';
    } else if (date.getDate() === now.getDate()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.getDate() === tomorrow.getDate()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getConfidenceColor = (confidenceLevel) => {
    if (confidenceLevel > 75) return colors.success;
    if (confidenceLevel > 50) return colors.warning;
    return colors.error;
  };

  const styles = StyleSheet.create({
    predictionContainer: {
      backgroundColor: `${colors.secondary}40`,
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    predictionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: colors.text,
    },
    predictionText: {
      fontSize: 14,
      color: colors.text,
    },
    predictionError: {
      fontSize: 14,
      color: colors.error,
    },
    confidenceText: {
      fontSize: 12,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.predictionContainer}>
      <Text style={styles.predictionTitle}>Next Predicted Toilet Trips:</Text>

      {weePrediction && (
        <View>
          {weePrediction.nextPredicted ? (
            <View>
              <Text style={styles.predictionText}>
                {selectedDog.name} might need to wee {formatPrediction(weePrediction.nextPredicted)}
              </Text>
              <Text style={[styles.confidenceText, { color: getConfidenceColor(weePrediction.confidenceLevel) }]}>
                Confidence: {Math.round(weePrediction.confidenceLevel)}%
              </Text>
              {showWeeFeedback && (
                <PredictionFeedback
                  onFeedback={(isCorrect) => handleFeedback('wee', isCorrect)}
                  colors={colors}
                />
              )}
            </View>
          ) : (
            <Text style={styles.predictionError}>{weePrediction.error}</Text>
          )}
        </View>
      )}

      {pooPrediction && (
        <View>
          {pooPrediction.nextPredicted ? (
            <View>
              <Text style={styles.predictionText}>
                {selectedDog.name} might need to poo {formatPrediction(pooPrediction.nextPredicted)}
              </Text>
              <Text style={[styles.confidenceText, { color: getConfidenceColor(pooPrediction.confidenceLevel) }]}>
                Confidence: {Math.round(pooPrediction.confidenceLevel)}%
              </Text>
              {showPooFeedback && (
                <PredictionFeedback
                  onFeedback={(isCorrect) => handleFeedback('poo', isCorrect)}
                  colors={colors}
                />
              )}
            </View>
          ) : (
            <Text style={styles.predictionError}>{pooPrediction.error}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default NextTripPrediction;