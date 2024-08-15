import React, { useState } from 'react';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import EmptyState from '../../components/EmptyState';
import { getUserPosts, signOut } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons } from '../../constants';
import InfoBox from '../../components/InfoBox';
import { RefreshControl } from 'react-native';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { useTheme } from '../../config/theme';

const Profile = () => {
  const { user } = useGlobalContext();
  const { colors } = useTheme();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const logout = async () => {
    try {
      await signOut();
      // Reload the app
      await Updates.reloadAsync();
    } catch (error) {
      // If reload fails, fallback to navigation
      router.replace("/sign-in");
    }
  };

  return (
    <AuthenticatedLayout>
          <SafeAreaView style={{ backgroundColor: colors.accent, flex: 1 }}>
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
              colors={colors}
            />
          )}
          ListHeaderComponent={() => (
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 0, marginBottom: 48, paddingHorizontal: 16 }}>
              {/* <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end', marginBottom: 8 }}>
                <Image source={icons.logout} resizeMode="contain" style={{ width: 24, height: 24, tintColor: colors.tint }} />
              </TouchableOpacity> */}
              <View style={{ width: 64, height: 64, borderWidth: 1, borderColor: colors.tint, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: user?.avatar }} style={{ width: '90%', height: '90%', borderRadius: 8 }} resizeMode='cover' />
              </View>

              <InfoBox 
                title={user?.username}
                containerStyles={{ marginTop: 20, marginBottom: 0 }}
                titleStyles={{ fontSize: 18, color: colors.text }}
                colors={colors}
              />
              <View style={{ marginTop: 0, flexDirection: 'row' }}>
                <InfoBox 
                  title={posts.length || 0}
                  subtitle="Posts"
                  containerStyles={{ marginRight: 40 }}
                  titleStyles={{ fontSize: 20, color: colors.text }}
                  subtitleStyles={{ color: colors.text }}
                  colors={colors}
                />
                <InfoBox 
                  title="1.2k"
                  subtitle="Likes"
                  titleStyles={{ fontSize: 20, color: colors.text }}
                  subtitleStyles={{ color: colors.text }}
                  colors={colors}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="No Videos Found"
              subtitle="No videos found for this search query"
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

export default Profile;