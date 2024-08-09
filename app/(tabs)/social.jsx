import { View, Text, FlatList, Image, RefreshControl, Alert, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchInput from '../../components/SearchInput';
import { icons, images } from '../../constants';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { getAllPosts, getLatestPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { StatusBar } from 'expo-status-bar';
import { useGlobalContext } from '../../context/GlobalProvider';
import AddNewMedia from '../../components/AddNewMedia';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
const Social = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { data: latestPosts } = useAppwrite(getLatestPosts);
  const [isMediaVisible, setIsMediaVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <AuthenticatedLayout>
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">Welcome To Puppy Social</Text>
                <Text className="text-2xl font-psemibold text-white">Upload Dog Pictures!</Text>
              </View>
              <View className="mt-1.5">
                <TouchableOpacity onPress={() => setIsMediaVisible(true)}>
                  <Image
                    source={icons.plus}
                    className="w-9 h-10"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <SearchInput />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-3">
                Latest Posts
              </Text>
              <Trending posts={latestPosts ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="Be the first to upload!"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
        />
      </Modal>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
    </AuthenticatedLayout>
  );
};

export default Social;
