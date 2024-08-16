import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image, StyleSheet } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/GlobalProvider';
import { useTheme } from '../config/theme';

export default function App() {
    const { IsLoading, isLoggedIn } = useGlobalContext();
    const { colors, isDark } = useTheme();

    if (!IsLoading && isLoggedIn) return <Redirect href="/home" />

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        contentContainer: {
            minHeight: '85%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
        },
        logo: {
            width: 130,
            height: 84,
        },
        cards: {
            maxWidth: 380,
            width: '100%',
            height: 300,
            backgroundColor: colors.background,
        },
        titleContainer: {
            position: 'relative',
            marginVertical: 20,
        },
        title: {
            fontSize: 24,
            color: colors.text,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        highlightedText: {
            color: colors.primary,
        },
        path: {
            width: 336,
            height: 10,
            position: 'absolute',
            bottom: -4,
            right: -8,
        },
        subtitle: {
            fontSize: 14,
            color: colors.text,
            marginTop: 28,
            textAlign: 'center',
        },
        button: {
            width: '100%',
            marginTop: 28,
            padding: 15,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Image 
                    source={images.dog}
                    style={styles.logo}
                    resizeMode='contain'
                />

                <Image 
                    source={images.cards}
                    style={styles.cards}
                    resizeMode='contain'
                />

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        Master your dog's toilet training with{' '}
                        <Text style={styles.highlightedText}>Puppy Potty Pal</Text>
                    </Text>
                    <Image 
                        source={images.path}
                        style={styles.path}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.subtitle}>
                    Where simplicity meets efficiency: never miss your puppy's toilet time again.
                </Text>

                <CustomButton
                    title="Continue with Email"
                    handlePress={() => router.push('/sign-in')}
                    containerStyles={styles.button}
                />
            </ScrollView>

            <StatusBar 
                backgroundColor={colors.background} 
                style={isDark ? 'light' : 'dark'}
            />
        </SafeAreaView>
    );
}