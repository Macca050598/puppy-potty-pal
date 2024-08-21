import React, { useState } from 'react';
import { View, Text, FlatList, Image, RefreshControl, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SearchInput from '../../components/SearchInput';
import { icons, images } from '../../constants';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { getPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';
import AddNewMedia from '../../components/AddNewMedia';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useTheme } from '../../config/theme';

const Social = () => {
  const { user } = useGlobalContext();
  const { colors } = useTheme();
  const { data: posts, refetch } = useAppwrite(getPosts);
  const { data: latestPosts } = useAppwrite(getPosts);
  const [isMediaVisible, setIsMediaVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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
            <VideoCard
            $id={item.$id} // Ensure this is correct
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              creator={item.creator.username}
              avatar={item.creator.avatar}
              colors={colors}
              likes={item.likes}
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
                colors={colors} />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Videos Found"
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={isMediaVisible}
          onRequestClose={() => setIsMediaVisible(false)}
        >
          <AddNewMedia
            isVisible={isMediaVisible}
            onClose={() => setIsMediaVisible(false)}
            colors={colors}
          />
        </Modal>

        <StatusBar backgroundColor={colors.accent} style={colors.text === "#FFFFFF" ? "light" : "dark"} />
      </SafeAreaView>
    </AuthenticatedLayout>
  );
};

export default Social;