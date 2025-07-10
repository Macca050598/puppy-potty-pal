import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SplashScreen, Stack} from 'expo-router';
import { useFonts} from 'expo-font';
import { useEffect } from 'react';
import GlobalProvider from '../context/GlobalProvider'
import { ThemeProvider } from '../config/theme';
import { Platform } from 'react-native';
import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';


   

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
    const [fontsLoaded, error] = useFonts({
        "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
        "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
        "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
        "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
        "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    });

    useEffect(() => {
        if(error) throw error;
        if(fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded, error])

    //Configure RevenueCat
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    console.log('🔍 RevenueCat Debug - API URL:', apiUrl);
    console.log('🔍 RevenueCat Debug - Platform:', Platform.OS);

    useEffect(() => {
        console.log('🔍 RevenueCat Debug - useEffect triggered');
        if (Platform.OS === 'ios') {
            console.log('🔍 RevenueCat Debug - iOS platform detected');
            if (!apiUrl) {
                console.error('🔍 RevenueCat Debug - No API URL provided');
                Alert.alert(
                    'Error configure RC',
                    'RevenueCat API key for ios not provided'
                );
            } else {
                console.log('🔍 RevenueCat Debug - API URL found, configuring RevenueCat...');
                try {
                    console.log('🔍 RevenueCat Debug - Setting log level to DEBUG');
                    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
                    
                    console.log('🔍 RevenueCat Debug - Calling Purchases.configure with API key:', apiUrl);
                    Purchases.configure({
                        apiKey: apiUrl,
                        observerMode: false,
                        useAmazon: false
                    });
                    console.log('✅ RevenueCat configured successfully with API key:', apiUrl);
                    
                    console.log('🔍 RevenueCat Debug - Fetching offerings...');
                    Purchases.getOfferings()
                        .then(offerings => {
                            console.log('✅ RevenueCat Offerings fetched successfully:');
                            console.log('🔍 RevenueCat Debug - Offerings object:', JSON.stringify(offerings, null, 2));
                            if (offerings && offerings.current) {
                                console.log('🔍 RevenueCat Debug - Current offering:', JSON.stringify(offerings.current, null, 2));
                            } else {
                                console.log('🔍 RevenueCat Debug - No current offering found');
                            }
                        })
                        .catch(error => {
                            console.error('❌ RevenueCat Error fetching offerings:');
                            console.error('🔍 RevenueCat Debug - Error object:', error);
                            console.error('🔍 RevenueCat Debug - Error message:', error.message);
                            console.error('🔍 RevenueCat Debug - Error code:', error.code);
                            console.error('🔍 RevenueCat Debug - Error name:', error.name);
                            console.error('🔍 RevenueCat Debug - Full error object:', JSON.stringify(error, null, 2));
                            
                            if (error.userInfo) {
                                console.error('🔍 RevenueCat Debug - Error userInfo:', JSON.stringify(error.userInfo, null, 2));
                            }
                            
                            Alert.alert(
                                'Error Details', 
                                `Failed to fetch offerings: ${error.message}\nCode: ${error.code}`
                            );
                        });
                } catch (error) {
                    console.error('❌ RevenueCat Error configuring RevenueCat:');
                    console.error('🔍 RevenueCat Debug - Configuration error:', error);
                    console.error('🔍 RevenueCat Debug - Full configuration error:', JSON.stringify(error, null, 2));
                    Alert.alert('Error', 'Failed to configure RevenueCat');
                }
            }
        } else {
            console.log('🔍 RevenueCat Debug - Not iOS platform, skipping RevenueCat configuration');
        } 
    }, [apiUrl])

    if(!fontsLoaded && !error) return null;



    return (
        <ThemeProvider>
        <GlobalProvider>
            <Stack>
                <Stack.Screen name = "index" options={{ headerShown: false}} />
                <Stack.Screen name = "(auth)" options={{ headerShown: false}} />
                <Stack.Screen name = "(tabs)" options={{ headerShown: false}} />
                <Stack.Screen name = "(userOptions)" options={{ headerShown: false}} />
                <Stack.Screen name = "(search)" options={{ headerShown: false}} />
                <Stack.Screen name = "(exportFile)" options={{ headerShown: false}} />
            </Stack>
        </GlobalProvider>
        </ThemeProvider>
    )
}

export default RootLayout