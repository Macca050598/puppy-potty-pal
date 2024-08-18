// notificationService.js
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleNotification = async (alert) => {
  const trigger = new Date(alert.time);
  trigger.setDate(trigger.getDate() + 1); // Schedule for tomorrow

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Pet Alert',
      body: alert.title,
    },
    trigger,
    identifier: alert.id,
  });
};

export const cancelNotification = async (alertId) => {
  await Notifications.cancelScheduledNotificationAsync(alertId);
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};