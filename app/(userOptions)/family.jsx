import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
// import { useNavigation } from '@react-navigation/native';
import { createFamily, getUserFamilies, joinFamily } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import FamilyManagementModal from '../../components/FamilyManagementModal';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const Family = () => {
  const { colors } = useTheme();
  // const navigation = useNavigation();
  const { user } = useGlobalContext();
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const userFamilies = await getUserFamilies(user.$id);
      setFamilies(userFamilies);
    } catch (error) {
      console.error("Error fetching families:", error);
      Alert.alert("Error", "Failed to fetch families");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (familyName.trim() === '') {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }
    try {
      const newFamily = await createFamily(user.$id, familyName);
      Alert.alert('Success', `Family "${newFamily.name}" created successfully!`);
      setFamilyName('');
      fetchFamilies();
    } catch (error) {
      Alert.alert('Error', 'Failed to create family: ' + error.message);
    }
  };

  const handleJoinFamily = async () => {
    if (familyCode.trim() === '') {
      Alert.alert('Error', 'Please enter a family code');
      return;
    }
    try {
      const result = await joinFamily(user.$id, familyCode);
      Alert.alert('Success', `Joined family "${result.family.name}" successfully!`);
      setFamilyCode('');
      fetchFamilies();
    } catch (error) {
      Alert.alert('Error', 'Failed to join family: ' + error.message);
    }
  };

  const handleFamilyPress = (family) => {
    setSelectedFamily(family);
    setModalVisible(true);
  };

  const renderFamilyItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleFamilyPress(item)}>
      <View style={styles.familyItem}>
        <Text style={[styles.familyName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.familyCode, { color: colors.tint }]}>Code: {item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
       height: '100%'
    },
    content: {
      flex: 1,
      padding: 20,
      height: '100%'
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: colors.tint,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
      paddingHorizontal: 10,
      color: colors.text,
      marginTop: 5,
    },
    button: {
      padding: 15,
      borderRadius: 5,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.background,
    },
    familyItem: {
      backgroundColor: colors.secondary,
      padding: 15,
      borderRadius: 5,
      marginBottom: 10,
    },
    familyName: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    familyCode: {
      fontSize: 14,
    },
    noFamilyMessage: {
      fontSize: 18,
      textAlign: 'center',
      color: colors.text,
      marginBottom: 20,
    },
    text: {
      fontSize: 16,
      fontWeight: 200,
      marginBottom: 5,
    }
  });

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right', 'top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Your Families</Text>
          
          {loading ? (
            <Text style={styles.noFamilyMessage}>Loading families...</Text>
          ) : families.length > 0 ? (
            <FlatList
              data={families}
              renderItem={renderFamilyItem}
              keyExtractor={(item) => item.$id}
              style={{ marginBottom: 20 }}
            />
          ) : (
            <Text style={styles.noFamilyMessage}>You aren't currently a part of any families</Text>
          )}

        <Text style={styles.familyName}>Create a Family</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter family name"
            placeholderTextColor={colors.tint}
            value={familyName}
            onChangeText={setFamilyName}
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateFamily}
          >
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>

          <Text style={styles.familyName}>Join a Family</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter family code"
            placeholderTextColor={colors.tint}
            value={familyCode}
            onChangeText={setFamilyCode}
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={handleJoinFamily}
          >
            <Text style={styles.buttonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FamilyManagementModal
        visible={modalVisible}
        family={selectedFamily}
        onClose={() => setModalVisible(false)}
        onUpdate={fetchFamilies}
        currentUserId={user.$id}
      />
              <StatusBar backgroundColor={colors.accent} style={colors.primary === '#FFFFFF' ? 'light' : 'dark'}/>

    </AuthenticatedLayout>
  );
};

export default Family;