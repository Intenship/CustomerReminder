
// import React, { useEffect, useRef, useState } from 'react';
// import { Alert, Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import * as Notifications from 'expo-notifications';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from './firebaseConfig';
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';
// import HomeScreen from './Components/Home';
// import LoginScreen from './Components/LoginScreen';
// import SignUpScreen from './Components/SignUpScreen';
// import AddCustomerScreen from './Components/AddCustomerScreen';
// import ViewCustomerScreen from './Components/ViewCustomerScreen';
// import { RootStackParamList } from './types';

// const Stack = createNativeStackNavigator<RootStackParamList>();

// // Configure notification handler for foreground behavior
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// export default function App() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const notificationListener = useRef<Notifications.Subscription | null>(null);
//   const responseListener = useRef<Notifications.Subscription | null>(null);

//   const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

// // Initialize background task on app startup
// useEffect(() => {
//   (async () => {
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
//     if (!isRegistered) {
//       await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
//         minimumInterval: 15 * 60, // 15 minutes
//         stopOnTerminate: false,
//         startOnBoot: true,
//       });
//     }
//   })();
// }, []);

//   useEffect(() => {
//     // Listen to authentication state changes
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsAuthenticated(!!user);
//       setIsLoading(false);
//     });

//     // Cleanup subscription on unmount
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     // Request notification permissions
//     (async () => {
//       const { status } = await Notifications.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission required', 'Notifications permissions are needed!');
//       }
//     })();

//     // Listener for receiving notifications in foreground
//     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
//       console.log('🔔 Notification received:', notification);
//       Alert.alert('Reminder', notification.request.content.body || '');
//     });

//     // Listener for tapping a notification
//     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
//       console.log('📩 Notification tapped/response received:', response);
//     });

//     return () => {
//       if (notificationListener.current) notificationListener.current.remove();
//       if (responseListener.current) responseListener.current.remove();
//     };
//   }, []);

//   // Show loading screen while checking auth state
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#00b4db" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="SignUp" component={SignUpScreen} />
//         <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
//         <Stack.Screen name="ViewCustomer" component={ViewCustomerScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ffffff',
//   },
// });

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebaseConfig'; // Import db here
import HomeScreen from './Components/Home';
import LoginScreen from './Components/LoginScreen';
import SignUpScreen from './Components/SignUpScreen';
import AddCustomerScreen from './Components/AddCustomerScreen';
import ViewCustomerScreen from './Components/ViewCustomerScreen';
import { RootStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ============ CONFIGURE NOTIFICATION HANDLER ============
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ============ BACKGROUND TASK DEFINITION ============
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

// Define background task ONLY ONCE at module level
if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
    try {
      console.log("🔄 Background task running...");
      
      // ✅ FIX: Firebase is already initialized in firebaseConfig.ts
      // Just import and use it - no need to initialize again
      
      const reminders = await AsyncStorage.getItem('customerReminders');
      
      if (reminders) {
        const remindersArray = JSON.parse(reminders);
        const now = new Date();
        
        for (const reminder of remindersArray) {
          if (!reminder.sent) {
            const reminderDate = new Date(reminder.date);
            
            if (reminderDate <= now && (now.getTime() - reminderDate.getTime()) < 5 * 60 * 1000) {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "⏰ Service Reminder",
                  body: reminder.customMessage || `Hello ${reminder.name}, your appliance is due for servicing.`,
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.MAX,
                  data: { customerId: reminder.id, type: 'service_reminder' },
                },
                trigger: null,
              });
              
              console.log(`✅ Notification sent for ${reminder.name}`);
              reminder.sent = true;
              await AsyncStorage.setItem('customerReminders', JSON.stringify(remindersArray));
            }
          }
        }
      }
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error("❌ Background task error:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // ============ REGISTER BACKGROUND TASK ============
  useEffect(() => {
    (async () => {
      try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
        if (!isRegistered) {
          await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
            minimumInterval: 15 * 60,
            stopOnTerminate: false,
            startOnBoot: true,
          });
          console.log("✅ Background task registered");
        }
      } catch (error) {
        console.error("❌ Failed to register background task:", error);
      }
    })();
  }, []);

  // ============ AUTHENTICATION STATE ============
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============ NOTIFICATION LISTENERS ============
  useEffect(() => {
    (async () => {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Service Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }
    })();

    // Listener for foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('🔔 Notification received (foreground):', notification);
      }
    );

    // Listener for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('📩 Notification tapped:', response);
        const { customerId } = response.notification.request.content.data;
        
        // Navigate to customer details if needed
        // navigation.navigate('ViewCustomer', { customerId });
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b4db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddCustomer" 
          component={AddCustomerScreen}
          options={{ title: 'Add Customer' }}
        />
        <Stack.Screen 
          name="ViewCustomer" 
          component={ViewCustomerScreen}
          options={{ title: 'Customer Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});