import * as React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './Screens/LandingPage';
import Result from './Screens/Result';
import Exam from './Screens/Exam';
import ExamHall from './Screens/ExamHall';

import TestPage from './Screens/TestPage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
const Tab = createBottomTabNavigator();
const HomeTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Result') {
          iconName = focused
            ? 'file-tray-stacked'
            : 'file-tray-stacked-outline';
        } else if (route.name === 'Exams') {
          iconName = focused ? 'book' : 'book-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FABB82',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Result" component={Result} />
    <Tab.Screen name="Home" component={LandingPage} />
    <Tab.Screen name="Exams" component={Exam} />
  </Tab.Navigator>
);
const App = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Bottom Tabs as first screen */}
        <Stack.Screen
          name="MainTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />

        {/* Now TestPage is available inside Stack */}
        <Stack.Screen
          name="TestPage"
          component={TestPage}
          options={{
            headerBackTitleVisible: false,
            title: '',
          }}
        />
        <Stack.Screen
          name="ExamHall"
          component={ExamHall}
          options={{
            headerBackTitleVisible: false,
            title: '',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
