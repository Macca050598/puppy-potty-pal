import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Button, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import DogWithSpeechBubble from '../components/DogWithSpeechBubble';
import { useGlobalContext } from '../context/GlobalProvider';

const GlobalDogPopup = () => {
  const { aiInsights } = useGlobalContext();
  const [isDogVisible, setIsDogVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [localAiInsights, setLocalAiInsights] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const isFirstMessageRef = useRef(true);
  const lastAppearanceTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const appStateRef = useRef(AppState.currentState);
  const interactionTimeoutRef = useRef(null);

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
        console.log('Loaded stored insights:', insights);
        setDebugInfo(prev => prev + '\nLoaded stored insights');
      }
    };

    loadStoredInsights();
  }, []);

  useEffect(() => {
    if (aiInsights) {
      setLocalAiInsights(aiInsights);
      AsyncStorage.setItem('AI_INSIGHTS', JSON.stringify(aiInsights));
      console.log('Updated local insights:', aiInsights);
      setDebugInfo(prev => prev + '\nUpdated local insights');
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
      const newMessage = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`;
      setCurrentMessage(newMessage);
      setIsDogVisible(true);
      console.log('Showing popup with message:', newMessage);
      setDebugInfo(prev => prev + '\nShowing popup');
      const hideDuration = Math.random() * (10000 - 5000) + 5000;
      setTimeout(() => {
        setIsDogVisible(false);
        console.log('Hiding popup');
        setDebugInfo(prev => prev + '\nHiding popup');
      }, hideDuration);
    } else {
      console.log('No random analysis available');
      setDebugInfo(prev => prev + '\nNo random analysis available');
    }
  }, [getRandomAnalysisField]);

  const scheduleNextAppearance = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const now = Date.now();
    const timeSinceLastAppearance = now - lastAppearanceTimeRef.current;

    let delay;
    if (isFirstMessageRef.current) {
      delay = Math.random() * (30000 - 15000) + 15000;
      isFirstMessageRef.current = false;
    } else {
      delay = Math.random() * (300000 - 120000) + 120000;
    }

    const minimumDelay = 120000;
    delay = Math.max(delay, minimumDelay - timeSinceLastAppearance);

    console.log(`Scheduling next appearance in ${delay / 1000} seconds`);
    setDebugInfo(prev => prev + `\nScheduling next appearance in ${Math.round(delay / 1000)} seconds`);

    timeoutRef.current = setTimeout(() => {
      const currentRouteName = route.name.toLowerCase();
      const allowedRoutes = ['home', 'social', 'profile', 'burger' ];

      console.log('Current route:', currentRouteName);
      console.log('App state:', appStateRef.current);
      setDebugInfo(prev => prev + `\nCurrent route: ${currentRouteName}, App state: ${appStateRef.current}`);

      if (allowedRoutes.includes(currentRouteName) && appStateRef.current === 'active') {
        showRandomMessage();
        lastAppearanceTimeRef.current = Date.now();
      } else {
        console.log('Skipping appearance due to route or app state');
        setDebugInfo(prev => prev + '\nSkipping appearance due to route or app state');
      }
      scheduleNextAppearance();
    }, delay);
  }, [route.name, showRandomMessage]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('App state changed to:', nextAppState);
      setDebugInfo(prev => prev + `\nApp state changed to: ${nextAppState}`);
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground, scheduling appearance');
        setDebugInfo(prev => prev + '\nApp came to foreground, scheduling appearance');
        scheduleNextAppearance();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };
  }, [scheduleNextAppearance]);

  useFocusEffect(
    useCallback(() => {
      const handleInteraction = () => {
        console.log('Tab press detected');
        setDebugInfo(prev => prev + '\nTab press detected');
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        interactionTimeoutRef.current = setTimeout(() => {
          console.log('Scheduling appearance after interaction');
          setDebugInfo(prev => prev + '\nScheduling appearance after interaction');
          scheduleNextAppearance();
        }, 30000);
      };

      navigation.addListener('tabPress', handleInteraction);

      return () => {
        navigation.removeListener('tabPress', handleInteraction);
      };
    }, [navigation, scheduleNextAppearance])
  );

  useEffect(() => {
    const insights = localAiInsights || aiInsights;
    if (insights) {
      console.log('Insights available, scheduling initial appearance');
      setDebugInfo('Insights available, scheduling initial appearance');
      scheduleNextAppearance();
    } else {
      console.log('No insights available');
      setDebugInfo('No insights available');
    }

    return () => {
      isFirstMessageRef.current = true;
      lastAppearanceTimeRef.current = 0;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };
  }, [localAiInsights, aiInsights, scheduleNextAppearance]);

  const handleManualTrigger = () => {
    console.log('Manual trigger pressed');
    setDebugInfo(prev => prev + '\nManual trigger pressed');
    showRandomMessage();
  };

  return (
    <View>
      <DogWithSpeechBubble
        isVisible={isDogVisible}
        onClose={() => {
          setIsDogVisible(false);
          console.log('Popup closed by user');
          setDebugInfo(prev => prev + '\nPopup closed by user');
        }}
        message={currentMessage}
      />
      {/* <Button title="Trigger Popup" onPress={handleManualTrigger} />
      <Text style={{ marginTop: 10 }}>Debug Info: {debugInfo}</Text> */}
    </View>
  );
};

export default GlobalDogPopup;