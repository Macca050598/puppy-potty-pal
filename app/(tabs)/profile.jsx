import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import EmptyState from '../../components/EmptyState';
import { getPosts, signOut } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import ImageCard from '../../components/ImageCard'; // Assuming you have this component
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons } from '../../constants';
import InfoBox from '../../components/InfoBox';
import { RefreshControl } from 'react-native';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useTheme } from '../../config/theme';

const Profile = () => {
  const { user } = useGlobalContext();
  const { colors } = useTheme();
  const { data: posts, refetch } = useAppwrite(() => getPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  return (
    <AuthenticatedLayout>
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <ImageCard
              title={item.title}
              imageUrl={item.image}
              creator={item.creator.username}
              avatar={item.creator.avatar}
              colors={colors}
              likes={item.likes}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <View style={[styles.avatarContainer, { borderColor: colors.tint }]}>
                <Image source={{ uri: user?.avatar }} style={styles.avatarImage} resizeMode='cover' />
              </View>
              <InfoBox 
                title={user?.username}
                containerStyles={styles.usernameContainer}
                titleStyles={[styles.usernameText, { color: colors.text }]}
                colors={colors}
              />
              <View style={styles.statsContainer}>
                <InfoBox 
                  title={posts.length || 0}
                  subtitle="Posts"
                  containerStyles={styles.statBox}
                  titleStyles={[styles.statTitle, { color: colors.text }]}
                  subtitleStyles={[styles.statSubtitle, { color: colors.text }]}
                  colors={colors}
                />
                <InfoBox 
                  title="1.2k"
                  subtitle="Likes"
                  titleStyles={[styles.statTitle, { color: colors.text }]}
                  subtitleStyles={[styles.statSubtitle, { color: colors.text }]}
                  colors={colors}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Images Found"
              subtitle="You haven't posted any images yet"
              titleStyle={{ color: colors.text }}
              subtitleStyle={{ color: colors.tint }}
            />
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.tint}
            />
          }
        />
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  usernameContainer: {
    marginTop: 20,
    marginBottom: 0,
  },
  usernameText: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 0,
  },
  statBox: {
    marginRight: 40,
  },
  statTitle: {
    fontSize: 20,
  },
  statSubtitle: {
    fontSize: 14,
  },
});

export default Profile;