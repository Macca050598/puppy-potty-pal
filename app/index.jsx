import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/GlobalProvider';
import { colors } from '../config/theme';
export default function App() {
    const {IsLoading, isLoggedIn} = useGlobalContext();

    if(!IsLoading && isLoggedIn) return <Redirect href="/home" />
    return (
      <SafeAreaView className="bg-primary h-full"> 
        <ScrollView contentContainerStyle={{ height: '100%'}}> 
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
        <Image 
            source={images.dog}
            className="w-[130px] h-[84px]"
            resizeMode='contain'
        />

        <Image 
        source={images.cards}
        className="max-w-[380px] w-full h-[300px]"
        resizeMode='contain'
        />

        <View className="relative m-5">
            <Text className="text-3xl text-white font-bold text-center">
            Master your dogs toilet traning with{' '}
            <Text className="text-secondary-200">Puppy Potty Pal</Text>
     
            </Text>
        <Image 
        source={images.path}
        className="w-[336px] h-[10px] align-bottom-4 -right-8"
        resizeMode="contain"
        />
        </View>

        <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">Where simplicity meets efficiency: never miss your puppies toilet time again.</Text>

        <CustomButton
        title="Continue with Email"
        handlePress={() => router.push('/sign-in')}
        containerStyles="w-full mt-7"
        />
        </View>
        </ScrollView>

        <StatusBar backgroundColor='#161622' style='light'/>
        </SafeAreaView>
    );
}
