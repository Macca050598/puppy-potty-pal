import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DogWithSpeechBubble from '../components/DogWithSpeechBubble'; // Your Dog component
import { analyzeToiletBreaks } from '../lib/appwrite'; // Your AI function
import { getUserDogs, getDogToiletEvents } from '../lib/appwrite'; // Add this to load dogs and events
import { useGlobalContext } from '../context/GlobalProvider'; // Assuming you have a global context for user data

const GlobalDogPopup = () => {
  const { user } = useGlobalContext();
  const [isDogVisible, setIsDogVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [events, setEvents] = useState([]);

  // Load dogs and events similar to the Home screen
  const loadDogs = async () => {
    try {
      const userDogs = await getUserDogs();
      setDogs(userDogs);
      if (userDogs.length > 0) {
        setSelectedDog(userDogs[0]);
        loadEvents(userDogs[0].$id);
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

  useEffect(() => {
    loadDogs();
  }, []);

  const fetchAIInsights = async () => {
    if (!selectedDog) {
      console.error('No dog selected for analysis');
      return ["I'm thinking..."];
    }

    try {
      const analysis = await analyzeToiletBreaks(events, selectedDog.name);
      return [
        analysis.pattern,
        analysis.nextBreak,
        analysis.improvement,
        analysis.concerns,
        analysis.advice,
      ];
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return ["I'm thinking..."];
    }
  };

  useEffect(() => {
    const showDog = async () => {
      const messages = await fetchAIInsights();
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      setIsDogVisible(true);

      setTimeout(() => {
        setIsDogVisible(false);
      }, 3000); // Show for 3 seconds
    };

    const intervalId = setInterval(() => {
      if (events.length > 0) {  // Only show the popup if there are events to analyze
        showDog();
      }
    }, Math.random() * (30000 - 15000) + 15000); // Every 15-30 seconds

    return () => clearInterval(intervalId);
  }, [events]);

  return (
    <View style={styles.container}>
      {isDogVisible && (
        <DogWithSpeechBubble message={currentMessage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Ensure it's on top of other elements
  },
});

export default GlobalDogPopup;
