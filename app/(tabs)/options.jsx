import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Linking, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { signOut } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useTheme } from '../../config/theme';
import { useState } from 'react';
const OptionItem = ({ icon, title, onPress, textColor }) => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <TouchableOpacity 
      style={[styles.optionItem, { backgroundColor: colors.background }]} 
      onPress={onPress}
    >
      <Feather name={icon} size={24} color={textColor || colors.tint} />
      <Text style={[styles.optionText, { color: textColor || colors.text }]}>{title}</Text>
      <Feather name="chevron-right" size={24} color={colors.text} />
    </TouchableOpacity>
  );
};

const Options = () => {
  const { user } = useGlobalContext();
  const { colors, toggleTheme, isDark } = useTheme();

  const handleOptionPress = (option) => {
    console.log(`${option} pressed`);
    // Add navigation or action logic here
  };

  const logout = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const sendEmail = async (subject) => {
    const email = 'support@puppypottypal.co.uk';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        throw new Error("Email client not available");
      }
    } catch (error) {
      console.error("Error opening email client:", error);
      Alert.alert(
        "Can't Open Email",
        `We couldn't open your email client. Would you like to copy the support email address (${email}) to your clipboard instead?`,
        [
          { text: "No", style: "cancel" },
          { 
            text: "Yes, Copy Email", 
            onPress: () => {
              Clipboard.setString(email);
              Alert.alert("Email Copied", `The support email (${email}) has been copied to your clipboard.`);
            }
          }
        ]
      );
    }
  };

  const requestReview = async () => {
    try {
      const isAvailable = await StoreReview.hasAction();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback for when StoreReview is not available
        Alert.alert(
          "Rate Us",
          "We'd love to hear your feedback! Unfortunately, in-app ratings are not available on your device. Would you like to rate us on the app store instead?",
          [
            { text: "No, thanks", style: "cancel" },
            { 
              text: "Yes, take me there", 
              onPress: () => {
                // You would replace these with your actual app store URLs
                const appStoreUrl = 'https://apps.apple.com/app/idYOUR_APP_ID';
                const playStoreUrl = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';
                Linking.openURL(Platform.OS === 'ios' ? appStoreUrl : playStoreUrl);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting review:", error);
    }
  };

  const options1 = [
    { icon: "edit", title: "Edit User", onPress: () => handleOptionPress("Edit User") },
    { icon: "users", title: "Family", onPress: () => router.push(`/family`)}, // New Family option
    { icon: "star", title: "Rate App", onPress: requestReview },
    { icon: "message-square", title: "Feature Request", onPress: () => sendEmail("Feature Request") },
    { icon: "alert-circle", title: "Report a Bug", onPress: () => sendEmail("Bug Report") },
    { icon: "help-circle", title: "FAQ", onPress: () => router.push(`/faq`) },
    { icon: "help-circle", title: "Analytics", onPress: () => router.push(`/analytics`) },
    { icon: "sun", title: isDark ? "Light Mode" : "Dark Mode", onPress: toggleTheme },
    { icon: "log-out", title: "Logout", onPress: logout, textColor: '#FF3B30' }
  ];

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.profileSection, { backgroundColor: colors.background }]}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{user?.username || 'User Name'}</Text>
            <Text style={[styles.email, { color: colors.primary }]}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        <FlatList
          data={options1}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <OptionItem
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
              textColor={item.textColor}
            />
          )}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.accent }]} />}
        />
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  optionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  separator: {
    height: 1,
  },
});

export default Options;