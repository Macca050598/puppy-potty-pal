import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DogWithSpeechBubble from '../components/DogWithSpeechBubble';
import { analyzeToiletBreaks, getUserDogs, getDogToiletEvents } from '../lib/appwrite';
import { useGlobalContext } from '../context/GlobalProvider';

const LAST_UPDATE_KEY = 'LAST_AI_UPDATE';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const GlobalDogPopup = () => {
  const { user } = useGlobalContext();
  const [isDogVisible, setIsDogVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [events, setEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const lastUpdateRef = useRef(0);

  const loadDogs = async () => {
    try {
      const userDogs = await getUserDogs();
      setDogs(userDogs);
      if (userDogs.length > 0) {
        setSelectedDog(userDogs[0]);
        await loadEvents(userDogs[0].$id);
      }
    } catch (error) {
      console.error('Failed to load dogs:', error);
    }
  };

  const loadEvents = async (dogId) => {
    try {
      const dogEvents = await getDogToiletEvents(dogId);
      setEvents(dogEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const fetchAIInsights = async () => {
    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      console.log('Skipping AI update, too soon since last update');
      return;
    }

    if (!selectedDog || events.length === 0) return null;

    try {
      const insights = await analyzeToiletBreaks(events, selectedDog.name);
      setAnalysis(insights);
      lastUpdateRef.current = now;
      await AsyncStorage.setItem(LAST_UPDATE_KEY, now.toString());
      return insights;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return null;
    }
  };

  const getRandomAnalysisField = useCallback(() => {
    if (!analysis) return null;
    const fields = ['pattern', 'nextBreak', 'improvement', 'concerns', 'advice'];
    const randomField = fields[Math.floor(Math.random() * fields.length)];
    return {
      field: randomField,
      message: analysis[randomField]
    };
  }, [analysis]);

  const showRandomMessage = useCallback(() => {
    const randomAnalysis = getRandomAnalysisField();
    if (randomAnalysis) {
      const { field, message } = randomAnalysis;
      setCurrentMessage(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`);
      setIsDogVisible(true);

      setTimeout(() => {
        setIsDogVisible(false);
      }, 6000); // Show for 6 seconds
    }
  }, [getRandomAnalysisField]);

  useEffect(() => {
    let intervalId;

    const initializeAndSchedule = async () => {
      const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
      lastUpdateRef.current = lastUpdate ? parseInt(lastUpdate) : 0;

      await loadDogs();

      if (Date.now() - lastUpdateRef.current >= UPDATE_INTERVAL) {
        await fetchAIInsights();
      }

      if (analysis) {
        intervalId = setInterval(() => {
          const delay = Math.random() * (60000 - 30000) + 30000; // Random delay between 30-60 seconds
          setTimeout(showRandomMessage, delay);
        }, 60000); // Check every minute
      }
    };

    initializeAndSchedule();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <DogWithSpeechBubble
      isVisible={isDogVisible}
      onClose={() => setIsDogVisible(false)}
      onAddTrip={async (tripData) => {
        setIsDogVisible(false);
        await loadDogs();
        await fetchAIInsights();
      }}
      message={currentMessage}
    />
  );
};

export default GlobalDogPopup;