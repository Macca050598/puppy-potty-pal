import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import DogWithSpeechBubble from '../components/DogWithSpeechBubble';
import { useGlobalContext } from '../context/GlobalProvider';

const GlobalDogPopup = () => {
  const { aiInsights } = useGlobalContext();
  const [popupState, setPopupState] = useState({
    isDogVisible: false,
    currentMessage: '',
  });
  const [localAiInsights, setLocalAiInsights] = useState(null);
  const isFirstMessageRef = useRef(true);
  const lastAppearanceTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const appStateRef = useRef(AppState.currentState);
  const interactionTimeoutRef = useRef(null);

  const checkStoredInsights = useCallback(async () => {
    try {
      const storedInsights = await AsyncStorage.getItem('AI_INSIGHTS');
      return storedInsights ? JSON.parse(storedInsights) : null;
    } catch (error) {
      console.error('Error checking stored insights:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    checkStoredInsights().then(insights => {
      if (insights) setLocalAiInsights(insights);
    });
  }, [checkStoredInsights]);

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
    return { field: randomField, message: insights[randomField] };
  }, [localAiInsights, aiInsights]);

  const showRandomMessage = useCallback(() => {
    const randomAnalysis = getRandomAnalysisField();
    if (randomAnalysis) {
      const { field, message } = randomAnalysis;
      const newMessage = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`;
      setPopupState({ isDogVisible: true, currentMessage: newMessage });
      setTimeout(() => setPopupState(prev => ({ ...prev, isDogVisible: false })), 
        Math.random() * (10000 - 5000) + 5000);
    }
  }, [getRandomAnalysisField]);

  const scheduleNextAppearance = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const now = Date.now();
    const timeSinceLastAppearance = now - lastAppearanceTimeRef.current;

    let delay = isFirstMessageRef.current 
      ? Math.random() * (30000 - 15000) + 15000
      : Math.random() * (300000 - 120000) + 120000;

    delay = Math.max(delay, 120000 - timeSinceLastAppearance);

    timeoutRef.current = setTimeout(() => {
      const currentRouteName = route.name.toLowerCase();
      const allowedRoutes = ['home', 'social', 'profile', 'burger'];

      if (allowedRoutes.includes(currentRouteName) && appStateRef.current === 'active') {
        showRandomMessage();
        lastAppearanceTimeRef.current = Date.now();
        isFirstMessageRef.current = false;
      }
      scheduleNextAppearance();
    }, delay);
  }, [route.name, showRandomMessage]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
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
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        interactionTimeoutRef.current = setTimeout(scheduleNextAppearance, 30000);
      };

      navigation.addListener('tabPress', handleInteraction);
      return () => navigation.removeListener('tabPress', handleInteraction);
    }, [navigation, scheduleNextAppearance])
  );

  useEffect(() => {
    const insights = localAiInsights || aiInsights;
    if (insights) scheduleNextAppearance();

    return () => {
      isFirstMessageRef.current = true;
      lastAppearanceTimeRef.current = 0;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };
  }, [localAiInsights, aiInsights, scheduleNextAppearance]);

  return (
    <View>
      <DogWithSpeechBubble
        isVisible={popupState.isDogVisible}
        onClose={() => setPopupState(prev => ({ ...prev, isDogVisible: false }))}
        message={popupState.currentMessage}
      />
    </View>
  );
};

export default GlobalDogPopup;