import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';
import FlashcardScreen from './screens/FlashcardScreenFixed';
import TestScreen from './screens/TestScreen';
import TestResultScreen from './screens/TestResultScreen';
import StatisticsScreen from './screens/StatisticsScreen';

const Stack = createStackNavigator();

const theme = {
  colors: {
    primary: '#E91E63',
    accent: '#9C27B0',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    disabled: '#BDBDBD',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" backgroundColor="#E91E63" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#E91E63',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'JLPT 일본어 학습' }}
          />
          <Stack.Screen
            name="LevelSelect"
            component={LevelSelectScreen}
            options={{ title: 'JLPT 레벨 선택' }}
          />
          <Stack.Screen
            name="Flashcard"
            component={FlashcardScreen}
            options={{ title: '플래시카드 학습' }}
          />
          <Stack.Screen
            name="Test"
            component={TestScreen}
            options={{ title: '단어 테스트' }}
          />
          <Stack.Screen
            name="TestResult"
            component={TestResultScreen}
            options={{ title: '테스트 결과' }}
          />
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{ title: '학습 통계' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
