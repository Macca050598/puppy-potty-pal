import React from 'react';
import { View, Text, Image } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { icons } from '../../constants';
import { useTheme } from '../../config/theme';

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Image 
        source={icon}
        resizeMode="contain"
        style={{ width: 24, height: 24, tintColor: color }}
      />
      <Text style={{ 
        fontSize: 12, 
        fontWeight: focused ? '600' : '400',
        color: color
      }}>
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const { colors } = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tint,
          tabBarStyle: {
            paddingTop: 2,
            backgroundColor: colors.secondary,
            borderTopWidth: 1,
            borderTopColor: colors.tint,
            height: 84
          }
        }}
      >
        <Tabs.Screen 
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.home} 
                color={color}
                name="Home"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="social"
          options={{
            title: 'Social',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.bookmark} 
                color={color}
                name="Social"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.profile} 
                color={color}
                name="Profile"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="burger"
          options={{
            title: 'Options',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.burger} 
                color={color}
                name="Options"
                focused={focused}
              />
            )
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;