import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import BookScreen from './screens/BookScreen';
import ChapterScreen from './screens/ChapterScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#89CFF0',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Holy Bible' }}
        />
        <Stack.Screen 
          name="Chapter" 
          component={ChapterScreen} 
          options={({ route }) => ({ title: `${route.params.bookName} Chapters` })}
        />
        <Stack.Screen 
          name="Book" 
          component={BookScreen} 
          options={({ route }) => ({ title: route.params.bookName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 