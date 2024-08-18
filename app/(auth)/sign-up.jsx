import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  }); 

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollViewContent: {
      minHeight: '90%',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    logo: {
      width: 100,
      height: 100,
    },
    title: {
      fontSize: 24,
      color: colors.text,
      fontWeight: '600',
      marginTop: 40,
      fontFamily: 'psemibold',
    },
    formField: {
      marginTop: 28,
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
    setIsSubmitting(true);

    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLoggedIn(result);
      Alert.alert("Success", "User Signed up successfully!");
      router.replace('/social');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
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
        />

        <CustomButton
          title="Sign Up"
          handlePress={submit}
          containerStyles={styles.buttonContainer}
          isLoading={isSubmitting}
        />

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Have an account already?
          </Text>
          <Link href="/sign-in" style={styles.linkHighlight}>
            Sign in
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;