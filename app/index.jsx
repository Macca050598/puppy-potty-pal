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
            minHeight: '80%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
        },
        logo: {
            width: 175,
            height: 175,
            marginBottom: 0,
        },
        cards: {
            maxWidth: 380,
            width: '100%',
            height: 300,
        },
        titleContainer: {
            position: 'relative',
            marginVertical: 20,
        },
        title: {
            fontSize: 28,
            color: colors.text,
            fontWeight: 'bold',
            fontFamily: 'pregular',
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
            fontSize: 16,
            color: colors.text,
            marginTop: 10,
            marginBottom: 15,
            textAlign: 'center',
            fontWeight: '500',
        },
        button: {
            width: '100%',
            marginTop: 20,
            padding: 20,
            fontSize: 18,
        },
        textStyles: {
            fontSize: 16,
            padding: 10,
        }
    });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Image 
                    source={images.logo1}
                    style={styles.logo}
                    resizeMode='contain'
                />

                <Image 
                    source={images.cards2}
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
                    title="Continue To Sign In..."
                    handlePress={() => router.push('/sign-in')}
                    containerStyles={styles.textStyles}
                    textStyles={styles.textStyles}
                />
            </ScrollView>

            <StatusBar 
                backgroundColor={colors.background} 
                style={isDark ? 'light' : 'dark'}
            />
        </SafeAreaView>
    );
}