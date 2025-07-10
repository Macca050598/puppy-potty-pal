import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const REVIEW_PROMPT_KEY = '@app_review_prompt';
const MIN_LAUNCHES = 3;
const MIN_DAYS_BETWEEN_PROMPTS = 14;

export const shouldShowReviewPrompt = async () => {
  try {
    const reviewData = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
    const data = reviewData ? JSON.parse(reviewData) : { lastPrompt: null, launchCount: 0 };
    
    // Increment launch count
    data.launchCount += 1;
    await AsyncStorage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(data));

    // Check if we should show the prompt
    if (data.launchCount >= MIN_LAUNCHES) {
      if (!data.lastPrompt || 
          (new Date() - new Date(data.lastPrompt)) / (1000 * 60 * 60 * 24) >= MIN_DAYS_BETWEEN_PROMPTS) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking review prompt:', error);
    return false;
  }
};

export const requestReview = async () => {
  try {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      // Update last prompt time
      const reviewData = await AsyncStorage.getItem(REVIEW_PROMPT_KEY);
      const data = reviewData ? JSON.parse(reviewData) : { lastPrompt: null, launchCount: 0 };
      data.lastPrompt = new Date().toISOString();
      await AsyncStorage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error requesting review:', error);
  }
};