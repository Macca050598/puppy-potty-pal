// notificationService.js
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleNotification = async (dogId, dogName, predictedTime) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    await Notifications.cancelScheduledNotificationAsync(`dog-${dogId}`);

    const notificationTrigger = convertToNotificationTrigger(new Date(predictedTime));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for a Toilet Trip",
        body: `${dogName} might need to go out soon!`,
      },
      trigger: notificationTrigger,
      identifier: `dog-${dogId}`,
    });

    console.log(`Notification scheduled for ${dogName} at ${predictedTime}`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelNotification = async (alertId) => {
  await Notifications.cancelScheduledNotificationAsync(alertId);
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};