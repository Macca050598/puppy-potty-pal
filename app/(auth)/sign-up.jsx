import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { StatusBar } from 'expo-status-bar';
import EULAModal from '../../components/EULAModal';

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEULA, setShowEULA] = useState(false);
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollViewContent: {
      minHeight: '80%',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    logo: {
      width: 150,
      height: 150,
    },
    title: {
      fontSize: 24,
      color: colors.text,
      fontWeight: '600',
      marginTop: 20,
      fontFamily: 'psemibold',
    },
    formField: {
      marginTop: 0,
    },
    buttonContainer: {
      marginTop: 28,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
      gap: 8,
    },
    linkText: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'pregular',
    },
    linkHighlight: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
  },
  });

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }
    setShowEULA(true);
  };

  const handleEULAAccept = async () => {
    setShowEULA(false);
    setIsSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLoggedIn(result);
      Alert.alert("Success", "User Signed up successfully!");
      router.replace('/home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEULADecline = () => {
    setShowEULA(false);
    Alert.alert('Sign Up Cancelled', 'You must accept the Terms of Service to use Puppy Potty Pal.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Image source={images.logoSmall} resizeMode='contain' style={styles.logo} />
        </View>
        <Text style={styles.title}>Sign up to Puppy Potty Pal</Text>

        <FormField
          title="Username"
          value={form.username}
          handleChangeText={(e) => setForm({ ...form, username: e })}
          otherStyles={styles.formField}
        />
        <FormField
          title="Email"
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          otherStyles={styles.formField}
          keyboardType="email-address"
        />
        <FormField
          title="Password"
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
          otherStyles={styles.formField}
          secureTextEntry
        />

        {isSubmitting ? (
          <ActivityIndicator size="large" color="#E67E22" />
        ) : (
          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles={styles.buttonContainer}
          />
        )}

      {/* <CustomButton
        title="Sign Up with Google"
        handlePress={handleGoogleSignUp}
        containerStyles={[styles.button, styles.googleButton]}
        textStyles={styles.googleButtonText}
        colors={colors}
      /> */}

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Have an account already?
          </Text>
          <Link href="/sign-in" style={styles.linkHighlight}>
            Sign in
          </Link>
        </View>
        <StatusBar backgroundColor={colors.accent} style={colors.text === '#FFFFFF' ? 'light' : 'dark'}/>
        <EULAModal 
          visible={showEULA}
          onAccept={handleEULAAccept}
          onDecline={handleEULADecline}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;