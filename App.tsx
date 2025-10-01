// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from './Components/Home';
// import { RootStackParamList } from './types';
// import LoginScreen from './Components/LoginScreen';
// import SignUpScreen from './Components/SignUpScreen';
// import AddCustomerScreen from './Components/AddCustomerScreen';
// import ViewCustomerScreen from './Components/ViewCustomerScreen';

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Login">
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="SignUp" component={SignUpScreen} />
//         <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
//          <Stack.Screen name="ViewCustomer" component={ViewCustomerScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
import React, { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import HomeScreen from './Components/Home';
import LoginScreen from './Components/LoginScreen';
import SignUpScreen from './Components/SignUpScreen';
import AddCustomerScreen from './Components/AddCustomerScreen';
import ViewCustomerScreen from './Components/ViewCustomerScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configure notification handler for foreground behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
const responseListener = useRef<Notifications.Subscription | null>(null);


  useEffect(() => {
    // Request notification permissions
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Notifications permissions are needed!');
      }
    })();

    // Listener for receiving notifications in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
      Alert.alert('Reminder', notification.request.content.body || '');
    });

    // Listener for tapping a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📩 Notification tapped/response received:', response);
    });

    return () => {
  if (notificationListener.current) notificationListener.current.remove();
  if (responseListener.current) responseListener.current.remove();
};

  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
        <Stack.Screen name="ViewCustomer" component={ViewCustomerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
