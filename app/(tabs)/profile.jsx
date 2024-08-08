import { router } from 'expo-router'
import { useState } from 'react'
import { View, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyState from '../../components/EmptyState'
import { getUserPosts, signOut} from '../../lib/appwrite'
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import {useGlobalContext} from '../../context/GlobalProvider'
import { TouchableOpacity } from 'react-native'
import { icons } from '../../constants'
import { Image } from 'react-native'
import InfoBox from '../../components/InfoBox'
import { RefreshControl } from 'react-native'

const Profile = () => {
  const { user, setUser, setIsLoggedIn} = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id));
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }
  const logout = async () => {
    await signOut();
    setUser(null)
    setIsLoggedIn(false)

    router.replace("/sign-in");
  }

  return (
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
          <View className="w-full justify-center items-center mt-0 mb-12 px-4" >
          <TouchableOpacity onPress={logout} className="flex w-full items-end mb-2" >
            <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
          </TouchableOpacity>
          <View className="w-16 h-16 border border-secondary-600 rounded-lg justify-center items-center">
            <Image  source={{ uri: user?.avatar}} className="w-[90%] h-[90%] rounded-lg" resizeMode='cover'/>
          </View>

          <InfoBox 
            title={user?.username}
            containerStyles="mt-5 mb-0"
            titleStyles="text-lg"
          />
          <View className="mt-0 flex-row">

          <InfoBox 
            title={posts.length || 0}
            subtitle="Posts"
            containerStyles="mr-10"
            titleStyles="text-xl"
          />
          
          <InfoBox 
          title="1.2k"
          subtitle="Likes"
          titleStyles="text-xl"
        />
          </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};
export default Profile;