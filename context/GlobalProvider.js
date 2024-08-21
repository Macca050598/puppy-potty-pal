import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";
import { checkAndUpdateAIInsights } from "../services/aiService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);

  const initializeApp = async () => {
    console.log("Initializing app...");
    setIsLoading(true);
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
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      console.log("App initialization complete");
    }
  };

  const refreshAllData = async () => {
    if (isLoggedIn) {
      await initializeApp();
    }
  };

  const login = async (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    await initializeApp();
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAiInsights(null);
    AsyncStorage.removeItem('AI_INSIGHTS');
  };

  useEffect(() => {
    initializeApp();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refreshAllData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const contextValue = {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    isLoading,
    aiInsights,
    setAiInsights,
    login,
    logout,
    refreshAllData
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;