import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
const FAQ = () => {
  const { colors } = useTheme();

  const faqData = [
    {
      question: "What is Puppy Potty Pal?",
      answer: "Puppy Potty Pal is an app designed to help dog owners track and manage their pets' toilet habits, making potty training easier and more efficient.",
      icon: "help-circle"
    },
    {
      question: "How do I add a new dog to my account?",
      answer: "To add a new dog, go to the home screen and tap the 'Add Dog' button. Fill in your dog's details and save.",
      icon: "plus-circle"
    },
    {
      question: "Can I share my dog's information with family members?",
      answer: "Yes! You can create a family group and invite members to share your dog's information and toilet trip data.",
      icon: "users"
    },
    {
      question: "How do I record a toilet trip?",
      answer: "On the home screen, select your dog and tap 'Add Trip'. Choose the type of trip (pee or poo) and the location, then save.",
      icon: "edit-2"
    },
    {
      question: "What is the 'Next Trip Prediction' feature?",
      answer: "This feature uses AI to analyze your dog's toilet habits and predict when they might need their next trip outside.",
      icon: "clock"
    }
  ];

  const Accordion = ({ title, content, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleAccordion = () => {
      const toValue = isOpen ? 0 : 1;
      Animated.timing(animation, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsOpen(!isOpen);
    };

    const bodyHeight = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    });

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.accordionHeader} onPress={toggleAccordion}>
          <Feather name={icon} size={24} color={colors.primary} style={styles.icon} />
          <Text style={[styles.accordionTitle, { color: colors.text }]}>{title}</Text>
          <Feather
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Animated.View style={[styles.accordionBody, { height: bodyHeight }]}>
          <Text style={[styles.accordionContent, { color: colors.text }]}>{content}</Text>
        </Animated.View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    accordionContainer: {
      marginBottom: 10,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: colors.card,
    },
    icon: {
      marginRight: 10,
    },
    accordionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
    },
    accordionBody: {
      overflow: 'hidden',
    },
    accordionContent: {
      padding: 15,
      fontSize: 14,
      lineHeight: 20,
    },
  });

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          {faqData.map((item, index) => (
            <Accordion
              key={index}
              title={item.question}
              content={item.answer}
              icon={item.icon}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
      <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>

    </AuthenticatedLayout>
  );
};

export default FAQ;