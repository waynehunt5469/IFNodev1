import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NewAnalysisScreen } from '../screens/NewAnalysisScreen';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AnalyzeOutput, AudienceType } from '../types/schema';

export type RootStackParamList = {
  Tabs: undefined;
  Analysis: {
    mode: 'new' | 'existing';
    artifactId?: string;
    originalText?: string;
    audienceType?: AudienceType;
    analysis?: AnalyzeOutput;
  };
};

export type TabParamList = {
  Home: undefined;
  NewAnalysis: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => (
  <Tabs.Navigator>
    <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Artifacts' }} />
    <Tabs.Screen name="NewAnalysis" component={NewAnalysisScreen} options={{ title: 'New Analysis' }} />
    <Tabs.Screen name="Settings" component={SettingsScreen} />
  </Tabs.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Analysis" component={AnalysisScreen} options={{ title: 'Analysis' }} />
    </Stack.Navigator>
  </NavigationContainer>
);
