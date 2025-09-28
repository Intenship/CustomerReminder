// // screens/AddCustomerScreen.tsx
// import React, { useState, useEffect, JSX } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Notifications from "expo-notifications";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { db, storage } from "../firebaseConfig";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

// type AddCustomerNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   "AddCustomer"
// >;

// type Props = {
//   navigation: AddCustomerNavigationProp;
// };

// export default function AddCustomerScreen({ navigation }: Props): JSX.Element {
//   const [name, setName] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [address, setAddress] = useState<string>("");
//   const [photo, setPhoto] = useState<string | undefined>(undefined);
//   const [notifyDate, setNotifyDate] = useState<Date | null>(null);
//   const [saving, setSaving] = useState<boolean>(false);
//   const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

//   useEffect(() => {
//     (async () => {
//       // camera permission (for taking photos)
//       const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
//       if (camStatus !== "granted") {
//         Alert.alert("Permission Required", "Camera permission is recommended to take photos.");
//       }

//       // notifications permission
//       const { status: notifStatus } = await Notifications.requestPermissionsAsync();
//       if (notifStatus !== "granted") {
//         console.log("Notification permission not granted");
//       }
//     })();
//   }, []);

//   const takePhoto = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.6,
//       aspect: [1, 1],
//     });

//     if (!result.canceled && result.assets?.length) {
//       setPhoto(result.assets[0].uri);
//     }
//   };

//   const selectFromGallery = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Required", "Gallery permission is needed to select photos.");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       quality: 0.6,
//       aspect: [1, 1],
//     });

//     if (!result.canceled && result.assets?.length) {
//       setPhoto(result.assets[0].uri);
//     }
//   };

//   const showPhotoOptions = () => {
//     Alert.alert(
//       "Select Photo",
//       "Choose how you'd like to add a photo",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Take Photo", onPress: takePhoto },
//         { text: "Choose from Gallery", onPress: selectFromGallery },
//       ]
//     );
//   };

//   // Upload a local uri to Firebase Storage and return public URL
//   // Upload local URI to Firebase Storage and get download URL
//   const uploadImageAsync = async (uri: string): Promise<string> => {
//     try {
//       // fetch file from local URI
//       const response = await fetch(uri);
//       const blob = await response.blob();

//       // unique path in storage
//       const timestamp = Date.now();
//       const randomString = Math.random().toString(36).slice(2);
//       const filename = `customers/${timestamp}_${randomString}.jpg`; // matches your storage rules

//       const storageRef = ref(storage, filename);

//       // upload file
//       await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });

//       // get public URL
//       const url = await getDownloadURL(storageRef);
//       return url;
//     } catch (error) {
//       console.error("Upload error:", error);
//       throw new Error("Failed to upload image. Please try again.");
//     }
//   };

//   const scheduleNotification = async (dateParam: Date) => {
//     const trigger = { date: dateParam } as Notifications.NotificationTriggerInput;
//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Customer Reminder 📞",
//           body: `Don't forget to follow up with ${name}`,
//           sound: true,
//         },
//         trigger,
//       });
//     } catch (err) {
//       console.error("scheduleNotification error:", err);
//     }
//   };

//   const validateForm = () => {
//     if (!name.trim()) {
//       Alert.alert("Validation Error", "Please enter customer name");
//       return false;
//     }
//     if (!phone.trim()) {
//       Alert.alert("Validation Error", "Please enter phone number");
//       return false;
//     }
//     if (!address.trim()) {
//       Alert.alert("Validation Error", "Please enter address");
//       return false;
//     }

//     // Basic phone validation
//     const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       Alert.alert("Validation Error", "Please enter a valid phone number");
//       return false;
//     }

//     return true;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setSaving(true);
//     try {
//       let photoURL: string | null = null;
//       if (photo) {
//         photoURL = await uploadImageAsync(photo);
//       }

//       // schedule local notification if set
//       if (notifyDate) {
//         await scheduleNotification(notifyDate);
//       }

//       // save to Firestore
//       const docRef = await addDoc(collection(db, "customers"), {
//         name: name.trim(),
//         phone: phone.trim(),
//         address: address.trim(),
//         photoURL: photoURL || null,
//         notifyDate: notifyDate || null,
//         createdAt: serverTimestamp(),
//       });

//       console.log("Saved customer id:", docRef.id);
//       Alert.alert("Success", "Customer added successfully!", [
//         { text: "OK", onPress: () => navigation.goBack() }
//       ]);
//     } catch (err) {
//       console.error("handleSave error:", err);
//       Alert.alert("Error", "Failed to save customer. Please check your internet connection and try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         style={styles.scrollContainer}
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Add New Customer</Text>
//           <Text style={styles.headerSubtitle}>Fill in the customer details</Text>
//         </View>

//         <View style={styles.formContainer}>
//           {/* Photo Section */}
//           <View style={styles.photoSection}>
//             <Text style={styles.sectionTitle}>Customer Photo</Text>
//             <View style={styles.photoContainer}>
//               {photo ? (
//                 <View style={styles.photoWrapper}>
//                   <Image source={{ uri: photo }} style={styles.customerPhoto} />
//                   <TouchableOpacity style={styles.changePhotoButton} onPress={showPhotoOptions}>
//                     <Text style={styles.changePhotoText}>Change</Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 <TouchableOpacity style={styles.addPhotoButton} onPress={showPhotoOptions} disabled={uploadingPhoto}>
//                   {uploadingPhoto ? (
//                     <ActivityIndicator color="#007bff" />
//                   ) : (
//                     <>
//                       <Text style={styles.addPhotoIcon}>📷</Text>
//                       <Text style={styles.addPhotoText}>Add Photo</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           {/* Form Fields */}
//           <View style={styles.inputSection}>
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Customer Name *</Text>
//               <TextInput
//                 placeholder="Enter full name"
//                 style={styles.input}
//                 value={name}
//                 onChangeText={setName}
//                 placeholderTextColor="#999"
//                 autoCapitalize="words"
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Phone Number *</Text>
//               <TextInput
//                 placeholder="Enter phone number"
//                 style={styles.input}
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#999"
//                 autoComplete="tel"
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Address *</Text>
//               <TextInput
//                 placeholder="Enter full address"
//                 style={[styles.input, styles.textArea]}
//                 value={address}
//                 onChangeText={setAddress}
//                 multiline={true}
//                 numberOfLines={3}
//                 placeholderTextColor="#999"
//                 textAlignVertical="top"
//               />
//             </View>
//           </View>

//           <View style={styles.notificationSection}>
//             <Text style={styles.sectionTitle}>Reminder Settings</Text>

//             <TouchableOpacity
//               style={styles.notificationButton}
//               onPress={() => setShowDatePicker(true)}
//             >
//               <Text style={styles.notificationIcon}>📅</Text>
//               <View style={styles.notificationTextContainer}>
//                 <Text style={styles.notificationTitle}>Pick Date</Text>
//                 <Text style={styles.notificationSubtitle}>
//                   {notifyDate
//                     ? notifyDate.toLocaleDateString()
//                     : "Tap to choose a date"}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.notificationButton}
//               onPress={() => setShowTimePicker(true)}
//             >
//               <Text style={styles.notificationIcon}>⏰</Text>
//               <View style={styles.notificationTextContainer}>
//                 <Text style={styles.notificationTitle}>Pick Time</Text>
//                 <Text style={styles.notificationSubtitle}>
//                   {notifyDate
//                     ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//                     : "Tap to choose a time"}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={notifyDate || new Date()}
//                 mode="date"
//                 display={Platform.OS === "ios" ? "inline" : "default"}
//                 minimumDate={new Date()}
//                 onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
//                   setShowDatePicker(false);
//                   if (event.type === "set" && selectedDate) {
//                     // preserve old time if set
//                     const newDate = new Date(selectedDate);
//                     if (notifyDate) {
//                       newDate.setHours(notifyDate.getHours(), notifyDate.getMinutes());
//                     }
//                     setNotifyDate(newDate);
//                   }
//                 }}
//               />
//             )}

//             {showTimePicker && (
//               <DateTimePicker
//                 value={notifyDate || new Date()}
//                 mode="time"
//                 display="default"
//                 onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
//                   setShowTimePicker(false);
//                   if (event.type === "set" && selectedTime) {
//                     // preserve old date if set
//                     const newDate = notifyDate ? new Date(notifyDate) : new Date();
//                     newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
//                     setNotifyDate(newDate);
//                   }
//                 }}
//               />
//             )}
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => navigation.goBack()}
//               disabled={saving}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//               onPress={handleSave}
//               disabled={saving}
//             >
//               {saving ? (
//                 <ActivityIndicator color="#fff" size="small" />
//               ) : (
//                 <Text style={styles.saveButtonText}>Save Customer</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 20,
//   },
//   header: {
//     padding: 20,
//     paddingBottom: 10,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     textAlign: "center",
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//     marginTop: 4,
//   },
//   formContainer: {
//     margin: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   photoSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 12,
//   },
//   photoContainer: {
//     alignItems: "center",
//   },
//   photoWrapper: {
//     position: "relative",
//   },
//   customerPhoto: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#f0f0f0",
//   },
//   changePhotoButton: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     backgroundColor: "#007bff",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   changePhotoText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   addPhotoButton: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#f8f9fa",
//     borderWidth: 2,
//     borderColor: "#e1e5e9",
//     borderStyle: "dashed",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   addPhotoIcon: {
//     fontSize: 32,
//     marginBottom: 4,
//   },
//   addPhotoText: {
//     color: "#666",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   inputSection: {
//     marginBottom: 24,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: "#e1e5e9",
//     padding: 16,
//     borderRadius: 8,
//     fontSize: 16,
//     backgroundColor: "#fff",
//     color: "#333",
//   },
//   textArea: {
//     minHeight: 80,
//     maxHeight: 120,
//   },
//   notificationSection: {
//     marginBottom: 32,
//   },
//   notificationButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e1e5e9",
//   },
//   notificationIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   notificationTextContainer: {
//     flex: 1,
//   },
//   notificationTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 2,
//   },
//   notificationSubtitle: {
//     fontSize: 14,
//     color: "#666",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 8,
//     borderWidth: 1.5,
//     borderColor: "#e1e5e9",
//     alignItems: "center",
//   },
//   cancelButtonText: {
//     color: "#666",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   saveButton: {
//     flex: 1,
//     backgroundColor: "#28a745",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     shadowColor: "#28a745",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   saveButtonDisabled: {
//     backgroundColor: "#ccc",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// screens/AddCustomerScreen.tsx
// screens/AddCustomerScreen.tsx - Expo Go Compatible Version

import React, { useState, useEffect, JSX } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SMS from "expo-sms";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { db, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";

type AddCustomerRouteProp = RouteProp<RootStackParamList, "AddCustomer">;
type AddCustomerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddCustomer"
>;

type Props = {
  navigation: AddCustomerNavigationProp;
  route: AddCustomerRouteProp;
};

type NotificationMethod = 'sms' | 'whatsapp' | 'both';

// Enhanced reminder storage with notification preferences
const storeReminder = async (
  customerId: string, 
  customerName: string, 
  phone: string,
  date: Date, 
  notificationMethod: NotificationMethod,
  customMessage?: string
) => {
  try {
    const reminders = await AsyncStorage.getItem('customerReminders');
    const remindersArray = reminders ? JSON.parse(reminders) : [];
    
    remindersArray.push({
      id: customerId,
      name: customerName,
      phone: phone,
      date: date.toISOString(),
      notificationMethod: notificationMethod,
      customMessage: customMessage || `Hi ${customerName}, this is a friendly reminder from our business. Hope you're doing well!`,
      created: new Date().toISOString(),
      sent: false
    });
    
    await AsyncStorage.setItem('customerReminders', JSON.stringify(remindersArray));
  } catch (error) {
    console.error('Failed to store reminder:', error);
  }
};

// Function to send SMS
const sendSMSReminder = async (phone: string, message: string, customerName: string) => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS Not Available', 'SMS functionality is not available on this device');
      return false;
    }

    const { result } = await SMS.sendSMSAsync([phone], message);
    
    if (result === 'sent') {
      console.log(`SMS sent successfully to ${customerName} (${phone})`);
      return true;
    } else {
      console.log(`SMS failed to send to ${customerName}: ${result}`);
      return false;
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    Alert.alert('SMS Error', 'Failed to send SMS. Please try again.');
    return false;
  }
};

// Function to send WhatsApp message
const sendWhatsAppReminder = async (phone: string, message: string, customerName: string) => {
  try {
    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Add country code if not present (assuming India +91, change as needed)
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : 
                          cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    const supported = await Linking.canOpenURL(whatsappUrl);
    
    if (supported) {
      await Linking.openURL(whatsappUrl);
      console.log(`WhatsApp opened for ${customerName} (${phone})`);
      return true;
    } else {
      Alert.alert(
        'WhatsApp Not Available', 
        'WhatsApp is not installed on this device',
        [
          {
            text: 'Install WhatsApp',
            onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.whatsapp')
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return false;
    }
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    Alert.alert('WhatsApp Error', 'Failed to open WhatsApp. Please try again.');
    return false;
  }
};

export default function AddCustomerScreen({ navigation,route }: Props) {
  const { customerToEdit } = route.params || {};
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [notifyDate, setNotifyDate] = useState<Date | null>(null);
  const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>('sms');
  const [customMessage, setCustomMessage] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

   useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setAddress(customerToEdit.address);
      setPhoto(customerToEdit.photoURL || customerToEdit.photo);
      if (customerToEdit.notifyDate) {
        setNotifyDate(new Date(customerToEdit.notifyDate));
      }
    }
  }, [customerToEdit]);
  
  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== "granted") {
        Alert.alert("Permission Required", "Camera permission is recommended to take photos.");
      }
    })();
  }, []);

  // Set default message when name changes
  useEffect(() => {
    if (name.trim() && !customMessage.trim()) {
      setCustomMessage(`Hi ${name.trim()}, this is a friendly reminder from our business. Hope you're doing well!`);
    }
  }, [name]);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.6,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.length) {
      setPhoto(result.assets[0].uri);
    }
  };

  const selectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Gallery permission is needed to select photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.6,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.length) {
      setPhoto(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      "Select Photo",
      "Choose how you'd like to add a photo",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: selectFromGallery },
      ]
    );
  };

  const uploadImageAsync = async (uri: string): Promise<string> => {
    try {
      setUploadingPhoto(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).slice(2);
      const filename = `customers/${timestamp}_${randomString}.jpg`;

      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter customer name");
      return false;
    }
    if (!phone.trim()) {
      Alert.alert("Validation Error", "Please enter phone number");
      return false;
    }
    if (!address.trim()) {
      Alert.alert("Validation Error", "Please enter address");
      return false;
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert("Validation Error", "Please enter a valid phone number");
      return false;
    }

    // Validate notification date if set
    if (notifyDate && notifyDate <= new Date()) {
      Alert.alert("Validation Error", "Reminder date must be in the future");
      return false;
    }

    // Validate custom message if reminder is set
    if (notifyDate && !customMessage.trim()) {
      Alert.alert("Validation Error", "Please enter a reminder message");
      return false;
    }

    return true;
  };

  const testNotification = async () => {
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter a phone number first");
      return;
    }

    const message = customMessage.trim() || `Hi ${name.trim() || 'there'}, this is a test message from our business!`;

    Alert.alert(
      "Test Notification",
      "Choose how to send the test message:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SMS",
          onPress: async () => {
            await sendSMSReminder(phone.trim(), message, name.trim() || "Customer");
          }
        },
        {
          text: "WhatsApp",
          onPress: async () => {
            await sendWhatsAppReminder(phone.trim(), message, name.trim() || "Customer");
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      let photoURL: string | null = null;
      if (photo) {
        photoURL = await uploadImageAsync(photo);
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, "customers"), {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        photoURL: photoURL || null,
        notifyDate: notifyDate || null,
        notificationMethod: notificationMethod,
        customMessage: customMessage.trim(),
        createdAt: serverTimestamp(),
      });

      // Store reminder locally for Expo Go compatibility
      if (notifyDate) {
        await storeReminder(
          docRef.id, 
          name.trim(), 
          phone.trim(),
          notifyDate, 
          notificationMethod,
          customMessage.trim()
        );
      }

      console.log("Saved customer id:", docRef.id);
      
      // Show success message with reminder info
      const methodText = notificationMethod === 'both' ? 'SMS & WhatsApp' : 
                        notificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS';
      
      const successMessage = notifyDate 
        ? `Customer added successfully! Reminder set for ${notifyDate.toLocaleDateString()} at ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} via ${methodText}.\n\nNote: Since you're using Expo Go, reminders are stored locally. The app will attempt to send ${methodText} when the reminder time arrives.`
        : "Customer added successfully!";
        
      Alert.alert("Success", successMessage, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error("handleSave error:", err);
      Alert.alert("Error", "Failed to save customer. Please check your internet connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Customer</Text>
          <Text style={styles.headerSubtitle}>Fill in the customer details</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Customer Photo</Text>
            <View style={styles.photoContainer}>
              {photo ? (
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.customerPhoto} />
                  <TouchableOpacity style={styles.changePhotoButton} onPress={showPhotoOptions}>
                    <Text style={styles.changePhotoText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addPhotoButton} onPress={showPhotoOptions} disabled={uploadingPhoto}>
                  {uploadingPhoto ? (
                    <ActivityIndicator color="#007bff" />
                  ) : (
                    <>
                      <Text style={styles.addPhotoIcon}>📷</Text>
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Customer Name *</Text>
              <TextInput
                placeholder="Enter full name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                placeholder="Enter phone number (with country code)"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                placeholder="Enter full address"
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                multiline={true}
                numberOfLines={3}
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Notification Section */}
          <View style={styles.notificationSection}>
            <Text style={styles.sectionTitle}>Reminder Settings (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Set a date, time, and method to send reminders to this customer{"\n"}
              <Text style={styles.expoGoNote}>
                📱 Note: Using Expo Go - supports SMS & WhatsApp
              </Text>
            </Text>

            {/* Notification Method Selection */}
            <View style={styles.methodSelection}>
              <Text style={styles.methodLabel}>Notification Method:</Text>
              <View style={styles.methodButtons}>
                <TouchableOpacity
                  style={[styles.methodButton, notificationMethod === 'sms' && styles.methodButtonActive]}
                  onPress={() => setNotificationMethod('sms')}
                >
                  <Text style={styles.methodButtonIcon}>💬</Text>
                  <Text style={[styles.methodButtonText, notificationMethod === 'sms' && styles.methodButtonTextActive]}>
                    SMS
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.methodButton, notificationMethod === 'whatsapp' && styles.methodButtonActive]}
                  onPress={() => setNotificationMethod('whatsapp')}
                >
                  <Text style={styles.methodButtonIcon}>📱</Text>
                  <Text style={[styles.methodButtonText, notificationMethod === 'whatsapp' && styles.methodButtonTextActive]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.methodButton, notificationMethod === 'both' && styles.methodButtonActive]}
                  onPress={() => setNotificationMethod('both')}
                >
                  <Text style={styles.methodButtonIcon}>📲</Text>
                  <Text style={[styles.methodButtonText, notificationMethod === 'both' && styles.methodButtonTextActive]}>
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.notificationIcon}>📅</Text>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>Pick Date</Text>
                <Text style={styles.notificationSubtitle}>
                  {notifyDate
                    ? notifyDate.toLocaleDateString()
                    : "Tap to choose a date"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.notificationIcon}>⏰</Text>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationTitle}>Pick Time</Text>
                <Text style={styles.notificationSubtitle}>
                  {notifyDate
                    ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Tap to choose a time"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Custom Message Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reminder Message</Text>
              <TextInput
                placeholder="Enter your reminder message..."
                style={[styles.input, styles.textArea]}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline={true}
                numberOfLines={3}
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            {/* Test Notification Button */}
            {phone.trim() && (
              <TouchableOpacity style={styles.testButton} onPress={testNotification}>
                <Text style={styles.testButtonIcon}>🧪</Text>
                <Text style={styles.testButtonText}>Test Notification</Text>
              </TouchableOpacity>
            )}

            {notifyDate && (
              <View style={styles.reminderPreview}>
                <Text style={styles.reminderPreviewLabel}>Reminder set for:</Text>
                <Text style={styles.reminderPreviewText}>
                  {notifyDate.toLocaleDateString()} at {notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <Text style={styles.reminderMethodText}>
                  via {notificationMethod === 'both' ? 'SMS & WhatsApp' : 
                      notificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                </Text>
                <TouchableOpacity 
                  style={styles.clearReminderButton}
                  onPress={() => setNotifyDate(null)}
                >
                  <Text style={styles.clearReminderText}>Clear Reminder</Text>
                </TouchableOpacity>
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={notifyDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (event.type === "set" && selectedDate) {
                    const newDate = new Date(selectedDate);
                    if (notifyDate) {
                      newDate.setHours(notifyDate.getHours(), notifyDate.getMinutes());
                    } else {
                      const now = new Date();
                      newDate.setHours(now.getHours(), now.getMinutes());
                    }
                    setNotifyDate(newDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={notifyDate || new Date()}
                mode="time"
                display="default"
                onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
                  setShowTimePicker(false);
                  if (event.type === "set" && selectedTime) {
                    const newDate = notifyDate ? new Date(notifyDate) : new Date();
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                    setNotifyDate(newDate);
                  }
                }}
              />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Customer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  formContainer: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  expoGoNote: {
    fontSize: 12,
    color: "#f39c12",
    fontStyle: "italic",
  },
  photoContainer: {
    alignItems: "center",
  },
  photoWrapper: {
    position: "relative",
  },
  customerPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changePhotoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e1e5e9",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  addPhotoText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e1e5e9",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    maxHeight: 120,
  },
  notificationSection: {
    marginBottom: 32,
  },
  methodSelection: {
    marginBottom: 16,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  methodButtons: {
    flexDirection: "row",
    gap: 8,
  },
  methodButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e1e5e9",
    backgroundColor: "#f8f9fa",
  },
  methodButtonActive: {
    borderColor: "#007bff",
    backgroundColor: "#e7f3ff",
  },
  methodButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  methodButtonTextActive: {
    color: "#007bff",
    fontWeight: "600",
  },
  notificationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    marginBottom: 12,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17a2b8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  testButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  reminderPreview: {
    backgroundColor: "#e8f5e8",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c3e6c3",
    marginTop: 8,
  },
  reminderPreviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d5a2d",
    marginBottom: 4,
  },
  reminderPreviewText: {
    fontSize: 16,
    color: "#2d5a2d",
    marginBottom: 4,
  },
  reminderMethodText: {
    fontSize: 14,
    color: "#2d5a2d",
    fontStyle: "italic",
    marginBottom: 8,
  },
  clearReminderButton: {
    alignSelf: "flex-start",
  },
  clearReminderText: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e1e5e9",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#28a745",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});