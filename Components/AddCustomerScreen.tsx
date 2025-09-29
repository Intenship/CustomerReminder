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

import React, { useState, useEffect } from "react";
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
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
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
    
    const filteredReminders = remindersArray.filter((reminder: any) => reminder.id !== customerId);
    
    filteredReminders.push({
      id: customerId,
      name: customerName,
      phone: phone,
      date: date.toISOString(),
      notificationMethod: notificationMethod,
      customMessage: customMessage || `Hi ${customerName}, this is a friendly reminder from our business. Hope you're doing well!`,
      created: new Date().toISOString(),
      sent: false
    });
    
    await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
  } catch (error) {
    console.error('Failed to store reminder:', error);
  }
};

const removeReminder = async (customerId: string) => {
  try {
    const reminders = await AsyncStorage.getItem('customerReminders');
    if (reminders) {
      const remindersArray = JSON.parse(reminders);
      const filteredReminders = remindersArray.filter((reminder: any) => reminder.id !== customerId);
      await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
    }
  } catch (error) {
    console.error('Failed to remove reminder:', error);
  }
};

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

const sendWhatsAppReminder = async (phone: string, message: string, customerName: string) => {
  try {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
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

export default function AddCustomerScreen({ navigation, route }: Props) {
  const { customerToEdit } = route.params || {};
  const isEditing = !!customerToEdit;
  
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [notifyDate, setNotifyDate] = useState<Date | null>(null);
  const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>('sms');
  const [customMessage, setCustomMessage] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [processingPhoto, setProcessingPhoto] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || "");
      setPhone(customerToEdit.phone || "");
      setAddress(customerToEdit.address || "");
      setPhoto(customerToEdit.photoBase64 || customerToEdit.photoURL || customerToEdit.photo);
      // setNotificationMethod(customerToEdit.notificationMethod || 'sms');
      setCustomMessage(customerToEdit.customMessage || "");
      if (customerToEdit.notifyDate) {
        setNotifyDate(new Date(customerToEdit.notifyDate));
      }
    }
  }, [customerToEdit]);
  
  useEffect(() => {
    (async () => {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== "granted") {
        Alert.alert("Permission Required", "Camera permission is recommended to take photos.");
      }
    })();
  }, []);

  useEffect(() => {
    if (name.trim() && !customMessage.trim() && !isEditing) {
      setCustomMessage(`Hi ${name.trim()}, this is a friendly reminder about your water purifier service. Hope you're doing well!`);
    }
  }, [name, isEditing]);

  const convertToBase64 = async (uri: string): Promise<string> => {
    try {
      setProcessingPhoto(true);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error converting to base64:", error);
      throw new Error("Failed to process image");
    } finally {
      setProcessingPhoto(false);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.length) {
      const base64Photo = await convertToBase64(result.assets[0].uri);
      setPhoto(base64Photo);
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
      quality: 0.5,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.length) {
      const base64Photo = await convertToBase64(result.assets[0].uri);
      setPhoto(base64Photo);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      "Water Purifier Photo",
      "Choose how you'd like to add a photo",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: selectFromGallery },
        ...(photo ? [{ text: "Remove Photo", onPress: () => setPhoto(undefined), style: "destructive" as const }] : [])
      ]
    );
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

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert("Validation Error", "Please enter a valid phone number");
      return false;
    }

    if (notifyDate && notifyDate <= new Date()) {
      Alert.alert("Validation Error", "Reminder date must be in the future");
      return false;
    }

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
      const customerData = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        photoBase64: photo || null,
        notifyDate: notifyDate ? notifyDate.toISOString() : null,
        notificationMethod: notificationMethod,
        customMessage: customMessage.trim(),
        updatedAt: serverTimestamp(),
        ...(isEditing ? {} : { createdAt: serverTimestamp() })
      };

      let customerId: string;

      if (isEditing && customerToEdit?.id) {
        const customerRef = doc(db, "customers", customerToEdit.id);
        await updateDoc(customerRef, customerData);
        customerId = customerToEdit.id;
        console.log("Updated customer id:", customerId);
      } else {
        const docRef = await addDoc(collection(db, "customers"), customerData);
        customerId = docRef.id;
        console.log("Created new customer id:", customerId);
      }

      if (notifyDate) {
        await storeReminder(
          customerId, 
          name.trim(), 
          phone.trim(),
          notifyDate, 
          notificationMethod,
          customMessage.trim()
        );
      } else {
        await removeReminder(customerId);
      }

      const methodText = notificationMethod === 'both' ? 'SMS & WhatsApp' : 
                        notificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS';
      
      const actionText = isEditing ? "updated" : "added";
      const successMessage = notifyDate 
        ? `Customer ${actionText} successfully! Reminder set for ${notifyDate.toLocaleDateString()} at ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} via ${methodText}.`
        : `Customer ${actionText} successfully!`;
        
      Alert.alert("Success", successMessage, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error("handleSave error:", err);
      const actionText = isEditing ? "update" : "save";
      const errorMessage = err.message || `Failed to ${actionText} customer. Please check your internet connection and try again.`;
      Alert.alert("Error", errorMessage);
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
          <Text style={styles.headerTitle}>
            {isEditing ? "✏️ Edit Customer" : "➕ Add New Customer"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? "Update customer details" : "Fill in the customer details"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Water Purifier Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💧 Water Purifier Photo</Text>
              <Text style={styles.optionalBadge}>Optional</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Add a photo of the water purifier for reference
            </Text>
            
            <View style={styles.photoContainer}>
              {photo ? (
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.purifierPhoto} />
                  <View style={styles.photoOverlay}>
                    <TouchableOpacity 
                      style={styles.photoActionButton} 
                      onPress={showPhotoOptions}
                    >
                      <Text style={styles.photoActionText}>Change Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addPhotoContainer} 
                  onPress={showPhotoOptions} 
                  disabled={processingPhoto}
                >
                  {processingPhoto ? (
                    <ActivityIndicator color="#007bff" size="large" />
                  ) : (
                    <>
                      <View style={styles.addPhotoIconContainer}>
                        <Text style={styles.addPhotoIcon}>📷</Text>
                      </View>
                      <Text style={styles.addPhotoTitle}>Add Photo</Text>
                      <Text style={styles.addPhotoSubtitle}>
                        Take a photo or choose from gallery
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Customer Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👤 Customer Details</Text>
              <Text style={styles.requiredBadge}>Required</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder="Enter customer's full name"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder="+91 XXXXX XXXXX"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Address <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder="Enter full address with landmark"
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

          {/* Reminder Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔔 Reminder Settings</Text>
              <Text style={styles.optionalBadge}>Optional</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Set automatic reminders for service follow-ups
            </Text>

            <View style={styles.methodSelection}>
              <Text style={styles.methodLabel}>Notification Method</Text>
              <View style={styles.methodButtons}>
                <TouchableOpacity
                  style={[styles.methodButton, notificationMethod === 'sms' && styles.methodButtonActive]}
                  onPress={() => setNotificationMethod('sms')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.methodIcon}>💬</Text>
                  <Text style={[styles.methodButtonText, notificationMethod === 'sms' && styles.methodButtonTextActive]}>
                    SMS
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.methodButton, notificationMethod === 'whatsapp' && styles.methodButtonActive]}
                  onPress={() => setNotificationMethod('whatsapp')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.methodIcon}>📱</Text>
                  <Text style={[styles.methodButtonText, notificationMethod === 'whatsapp' && styles.methodButtonTextActive]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.methodButton, notificationMethod === 'both' && styles.methodButtonActive]}
                  onPress={() => setNotificationMethod('both')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.methodIcon}>📲</Text>
                  <Text style={[styles.methodButtonText, notificationMethod === 'both' && styles.methodButtonTextActive]}>
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <Text style={styles.dateTimeValue}>
                    {notifyDate ? notifyDate.toLocaleDateString() : "Select date"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>⏰</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeValue}>
                    {notifyDate ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Select time"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Custom Message</Text>
              <TextInput
                placeholder="Enter your reminder message..."
                style={[styles.input, styles.textArea]}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline={true}
                numberOfLines={4}
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            {phone.trim() && customMessage.trim() && (
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={testNotification}
                activeOpacity={0.8}
              >
                <Text style={styles.testButtonIcon}>🧪</Text>
                <Text style={styles.testButtonText}>Test Notification</Text>
              </TouchableOpacity>
            )}

            {notifyDate && (
              <View style={styles.reminderPreview}>
                <View style={styles.reminderPreviewHeader}>
                  <Text style={styles.reminderPreviewTitle}>✓ Reminder Scheduled</Text>
                  <TouchableOpacity 
                    onPress={() => setNotifyDate(null)}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.reminderPreviewDate}>
                  {notifyDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={styles.reminderPreviewTime}>
                  at {notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <View style={styles.reminderMethodBadge}>
                  <Text style={styles.reminderMethodText}>
                    via {notificationMethod === 'both' ? 'SMS & WhatsApp' : 
                        notificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                  </Text>
                </View>
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
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? "💾 Update Customer" : "✓ Save Customer"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ecef",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6c757d",
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 20,
    lineHeight: 20,
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6c757d",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requiredBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#dc3545",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  photoContainer: {
    alignItems: "center",
  },
  photoWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
  },
  purifierPhoto: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    alignItems: "center",
  },
  photoActionButton: {
    paddingVertical: 6,
  },
  photoActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  addPhotoContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#dee2e6",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addPhotoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e7f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  addPhotoIcon: {
    fontSize: 32,
  },
  addPhotoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  addPhotoSubtitle: {
    fontSize: 13,
    color: "#6c757d",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  required: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    backgroundColor: "#fff",
    color: "#212529",
  },
  textArea: {
    minHeight: 100,
    maxHeight: 150,
    paddingTop: 14,
  },
  methodSelection: {
    marginBottom: 20,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  methodButtons: {
    flexDirection: "row",
    gap: 10,
  },
  methodButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#dee2e6",
    backgroundColor: "#f8f9fa",
  },
  methodButtonActive: {
    borderColor: "#007bff",
    backgroundColor: "#e7f3ff",
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  methodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6c757d",
  },
  methodButtonTextActive: {
    color: "#007bff",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#dee2e6",
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17a2b8",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    shadowColor: "#17a2b8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  reminderPreview: {
    backgroundColor: "#d4edda",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c3e6cb",
    marginTop: 16,
  },
  reminderPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderPreviewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#155724",
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#155724",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  reminderPreviewDate: {
    fontSize: 15,
    color: "#155724",
    fontWeight: "600",
    marginBottom: 2,
  },
  reminderPreviewTime: {
    fontSize: 14,
    color: "#155724",
    marginBottom: 8,
  },
  reminderMethodBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#155724",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reminderMethodText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: "#94d3a2",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});