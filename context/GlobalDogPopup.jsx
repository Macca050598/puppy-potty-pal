import React, { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DogWithSpeechBubble from '../components/DogWithSpeechBubble';
import { useGlobalContext } from '../context/GlobalProvider';

const GlobalDogPopup = () => {
  const { aiInsights } = useGlobalContext();
  const [isDogVisible, setIsDogVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [localAiInsights, setLocalAiInsights] = useState(null);
  const isFirstMessageRef = useRef(true);

  const checkStoredInsights = async () => {
    try {
      const storedInsights = await AsyncStorage.getItem('AI_INSIGHTS');
      if (storedInsights) {
        return JSON.parse(storedInsights);
      }
    } catch (error) {
      console.error('Error checking stored insights:', error);
    }
    return null;
  };

  useEffect(() => {
    const loadStoredInsights = async () => {
      const insights = await checkStoredInsights();
      if (insights) {
        setLocalAiInsights(insights);
      }
    };

    loadStoredInsights();
  }, []);

  useEffect(() => {
    if (aiInsights) {
      setLocalAiInsights(aiInsights);
      AsyncStorage.setItem('AI_INSIGHTS', JSON.stringify(aiInsights));
    }
  }, [aiInsights]);

  const getRandomAnalysisField = useCallback(() => {
    const insights = localAiInsights || aiInsights;
    if (!insights) return null;
    const fields = ['Observed Patterns', 'Next Break', 'Recommended Improvements', 'My Concerns', 'My Advice'];
    const randomField = fields[Math.floor(Math.random() * fields.length)];
    return {
      field: randomField,
      message: insights[randomField]
    };
  }, [localAiInsights, aiInsights]);

  const showRandomMessage = useCallback(() => {
    const randomAnalysis = getRandomAnalysisField();
    if (randomAnalysis) {
      const { field, message } = randomAnalysis;
      setCurrentMessage(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`);
      setIsDogVisible(true);
      // Hide the dog after a random duration between 5 and 10 seconds
      // const hideDuration = Math.random() * (10000 - 5000) + 5000;
      // setTimeout(() => setIsDogVisible(false), hideDuration);
    }
  }, [getRandomAnalysisField]);

  useEffect(() => {
    const insights = localAiInsights || aiInsights;
    if (insights) {
      const scheduleNextAppearance = () => {
        let delay;
        if (isFirstMessageRef.current) {
          // First message: 15-30 seconds
          delay = Math.random() * (30000 - 15000) + 15000;
          isFirstMessageRef.current = true;
        } else {
          // Subsequent messages: 2-5 minutes
        }

        setTimeout(() => {
          showRandomMessage();
          scheduleNextAppearance();
        }, delay);
      };

      scheduleNextAppearance();
    }

    // Cleanup function to reset isFirstMessageRef when component unmounts
    return () => {
      isFirstMessageRef.current = true;
    };
  }, [localAiInsights, aiInsights, showRandomMessage]);

  return (
    <DogWithSpeechBubble
      isVisible={isDogVisible}
      onClose={() => setIsDogVisible(false)}
      message={currentMessage}
    />
  );
};

export default GlobalDogPopup;