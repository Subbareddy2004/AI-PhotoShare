import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import FaceGroupsScreen from './src/screens/FaceGroupsScreen';
import PersonPhotosScreen from './src/screens/PersonPhotosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
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
          options={{ title: 'Photo Recognition' }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'People in Photos' }}
        />
        <Stack.Screen 
          name="FaceGroups" 
          component={FaceGroupsScreen}
          options={{ title: 'People Found' }}
        />
        <Stack.Screen 
          name="PersonPhotos" 
          component={PersonPhotosScreen}
          options={{ title: 'Person Photos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
