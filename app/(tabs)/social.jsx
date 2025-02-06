// Social.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SearchInput from '../../components/SearchInput';
import { icons, images } from '../../constants';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { getPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import AddNewMedia from '../../components/AddNewMedia';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useTheme } from '../../config/theme';
import ImageCard from '../../components/ImageCard';
import UserDetailModal from '../../components/UserDetailModal'; // Import the new modal component

const Social = () => {
  const { user } = useGlobalContext();
  const { colors } = useTheme();
  const { data: posts, refetch, mutate } = useAppwrite(getPosts);
  const latestPosts = posts?.slice(0, 5);
  const [isMediaVisible, setIsMediaVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserPress = (creator) => {
    // Fetch user details (e.g., from Appwrite) and set state
    setSelectedUser(creator);
    setIsUserModalVisible(true);
  };
  const handleUploadSuccess = (newPost) => {
    if (typeof mutate === 'function') {
      mutate((currentPosts) => [newPost, ...currentPosts], false);
      setRefreshing(true);
      refetch();
    } else {
      console.error('mutate is not a function');
    }
  };

  const handleModalClose = () => {
    setIsMediaVisible(false);
  };

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, refetch]);

  const handleLikeImage = async (imageId) => {
    if (!imageId) {
      console.error('No imageId provided to likeImage function');
      return;
    }
    try {
      mutate((currentPosts) => {
        return currentPosts.map((post) => {
          if (post.$id === imageId) {
            return {
              ...post,
              likes: [...(post.likes || []), user.$id]
            };
          }
          return post;
        });
      }, false);

      await likeImage(imageId);
    } catch (error) {
      console.error('Error liking image:', error);
      await refetch();
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    header: {
      marginVertical: 24,
      paddingHorizontal: 16,
      gap: 24,
    },
    headerTop: {
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginBottom: 24,
    },
    welcomeText: {
      fontWeight: '500',
      fontSize: 14,
      color: colors.primary,
    },
    titleText: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
    },
    plusIcon: {
      width: 36,
      height: 40,
      tintColor: colors.primary,
    },
    latestPostsContainer: {
      width: '100%',
      flex: 1,
      paddingTop: 20,
      paddingBottom: 32,
    },
    latestPostsText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '400',
      marginBottom: 12,
    },
  });

  return (
    <AuthenticatedLayout>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <ImageCard
              $id={item.$id}
              title={item.title}
              imageUrl={item.image}
              creator={item.creator ? item.creator.username : ''}
              avatar={item.creator ? item.creator.avatar : null}
              colors={colors}
              likes={item.likes}
              onLike={handleLikeImage}
              onUserPress={handleUserPress}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.welcomeText}>Welcome To Puppy Social</Text>
                  <Text style={styles.titleText}>Upload Dog Pictures!</Text>
                </View>
                <View style={{ marginTop: 6 }}>
                  <TouchableOpacity onPress={() => setIsMediaVisible(true)}>
                    <Image
                      source={icons.plus}
                      style={styles.plusIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <SearchInput colors={colors} />

              <View style={styles.latestPostsContainer}>
                <Text style={styles.latestPostsText}>
                  Latest Posts
                </Text>
                <Trending 
                  posts={latestPosts ?? []} 
                  colors={colors} 
                />
              </View>
            </View>
            
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Images Found"
              subtitle="Be the first to upload!"
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

          <UserDetailModal 
          visible={isUserModalVisible} 
          user={handleUserPress} 
          onClose={() => setIsUserModalVisible(false)} 
        />
          <AddNewMedia
            isVisible={isMediaVisible}
            onClose={() => {
              console.log('Closing modal');
              setIsMediaVisible(false);
            }}
            onUploadSuccess={handleUploadSuccess}
            colors={colors}
          />
       

        <StatusBar backgroundColor={colors.accent} style={colors.text === "#FFFFFF" ? "light" : "dark"} />
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

export default Social;