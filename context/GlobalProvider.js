import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";
import { checkAndUpdateAIInsights } from "../services/aiService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);

 // In src/context/GlobalProvider.js

useEffect(() => {
    const initializeApp = async () => {
      console.log("Initializing app...");
      try {
        const res = await getCurrentUser();
        if (res) {
          console.log("User logged in:", res.name);
          setIsLoggedIn(true);
          setUser(res);
          
          console.log("Checking for AI insights...");
          const insights = await checkAndUpdateAIInsights();
          if (insights) {
            console.log("AI insights updated:", JSON.stringify(insights));
            setAiInsights(insights);
            await AsyncStorage.setItem('AI_INSIGHTS', JSON.stringify(insights));
            console.log("AI insights stored in AsyncStorage");
          } else {
            console.log("No new AI insights available");
          }
        } else {
          console.log("No user logged in");
        }
      } catch (error) {
        console.error("Error during app initialization:", error);
      } finally {
        setIsLoading(false);
        console.log("App initialization complete");
      }
    };
  
    initializeApp();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
        aiInsights,
        setAiInsights
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;