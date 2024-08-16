import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Helper function to convert Date to a notification trigger format
const convertToNotificationTrigger = (date) => {
  const now = new Date();
  const secondsUntilTrigger = Math.max(0, Math.floor((date - now) / 1000));
  return {
    seconds: secondsUntilTrigger,
  };
};

export const scheduleNotification = async (dogId, predictedTime) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Notification permissions are required to set reminders.');
    return;
  }

  // Cancel any existing notifications for the same dog
  await Notifications.cancelScheduledNotificationAsync(`dog-${dogId}`);

  // Ensure predictedTime is a Date object and convert it to a trigger format
  const notificationTrigger = convertToNotificationTrigger(new Date(predictedTime));

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for a Toilet Trip",
      body: `${dogId} might need to go out soon!`,
    },
    trigger: notificationTrigger,
    identifier: `dog-${dogId}`,
  });

  console.log(`Notification scheduled for ${predictedTime}`);
};
