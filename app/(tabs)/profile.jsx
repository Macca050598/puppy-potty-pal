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
import UserDetailModal from '../../components/UserDetailModal'; // Import the new modal component

const Profile = () => {
  const { user } = useGlobalContext();
  const { colors } = useTheme();
  const { data: posts, refetch } = useAppwrite(() => getPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserPress = (creator) => {
    // Fetch user details (e.g., from Appwrite) and set state
    setSelectedUser(creator);
    setIsUserModalVisible(true);
  };
    // Log the posts structure for debugging
    console.log('Posts:', posts);

    // Filter posts to only include those from the logged-in user
    const userPosts = posts.filter(post => {
      // Check if post.creator exists and has the $id property
      if (post.creator && post.creator.$id) {
        console.log('Post Creator ID:', post.creator.$id); // Log each post's creator ID
        console.log('User ID:', user.$id); // Log the user ID
        return post.creator.$id === user.$id; // Check if the creator's ID matches the user's ID
      }
      return false; // If post.creator is null or doesn't have $id, exclude this post
    });
  
    // Log the filtered user posts
    console.log('User Posts:', userPosts);


  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  const totalLikes = posts.reduce((acc, post) => acc + (post.likes || 0), 0);
  console.log(totalLikes)
  
  return (
    <AuthenticatedLayout>
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <ImageCard
              $id={item.$id}
              title={item.title}
              imageUrl={item.image}
              creator={item.creator.username}
              avatar={item.creator.avatar}
              colors={colors}
              likes={item.likes}
              onLike={handleLikeImage}
              onUserPress={handleUserPress}

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
                  title={userPosts.length || 0}
                  subtitle="Posts"
                  containerStyles={styles.statBox}
                  titleStyles={[styles.statTitle, { color: colors.text }]}
                  subtitleStyles={[styles.statSubtitle, { color: colors.text }]}
                  colors={colors}
                />
                <InfoBox 
                  title={totalLikes}
                  subtitle="Likes"
                  titleStyles={[styles.statTitle, { color: colors.text }]}
                  subtitleStyles={[styles.statSubtitle, { color: colors.text }]}
                  colors={colors}
                />
              </View>
            </View>
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
    width: 120,
    height: 120,
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