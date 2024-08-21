import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeToiletBreaks, getCurrentUserDogs, getDogToiletEvents } from '../lib/appwrite';

const LAST_UPDATE_KEY = 'LAST_AI_UPDATE';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let isUpdating = false;

export const checkAndUpdateAIInsights = async () => {
  if (isUpdating) {
    console.log("AI update already in progress, skipping");
    return null;
  }

  isUpdating = true;

  try {
    console.log("Starting AI insights check");
    
    const lastUpdate = await AsyncStorage.getItem(LAST_UPDATE_KEY);
    const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
    console.log("Last update time:", new Date(lastUpdateTime).toLocaleString());

    if (Date.now() - lastUpdateTime >= UPDATE_INTERVAL) {
      console.log("Update interval exceeded, fetching new insights");
      
      const dogs = await getCurrentUserDogs();
      console.log("Fetched dogs:", dogs.length);
      
      if (dogs.length > 0) {
        const events = await getDogToiletEvents(dogs[0].$id);
        console.log("Fetched events for first dog:", events.length);
        
        if (events.length > 0) {
          console.log("Analyzing toilet breaks...");
          const insights = await analyzeToiletBreaks(events, dogs[0].name);
          await AsyncStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
          console.log("New insights generated and saved");
          return insights;
        } else {
          console.log("No events found for analysis");
        }
      } else {
        console.log("No dogs found");
      }
    } else {
      console.log("Update interval not exceeded, skipping update");
    }
    
    console.log("AI insights check complete");
    return null;
  } finally {
    isUpdating = false;
  }
};


// Uncomment the following lines to force an AI update on each import of this file
// export const forceAIUpdate = async () => {
//   console.log('Forcing AI update...');
//   await AsyncStorage.setItem(LAST_UPDATE_KEY, '0'); // Reset the last update time
//   const insights = await checkAndUpdateAIInsights();
//   if (insights) {
//     console.log('Forced AI update completed.');
//     return insights;
//   } else {
//     console.log('Cannot force update: No data available for analysis');
//     return null;
//   }
// };

// forceAIUpdate();

// export const getMockAIInsights = () => {
//   return {
//     pattern: "Your dog seems to need bathroom breaks every 4-6 hours.",
//     nextBreak: "Based on the pattern, the next break might be needed around 2 PM.",
//     improvement: "There's been a 20% improvement in consistency of bathroom breaks over the last week.",
//     concerns: "No major concerns noted. Keep up the good work!",
//     advice: "Try to maintain a consistent feeding schedule to help regulate bathroom breaks."
//   };
// };