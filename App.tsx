import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Components/Home';
import { RootStackParamList } from './types';
import LoginScreen from './Components/LoginScreen';
import SignUpScreen from './Components/SignUpScreen';
import AddCustomerScreen from './Components/AddCustomerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
