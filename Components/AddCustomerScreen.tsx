
// import React, { useState, useEffect } from "react";
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
//   Linking,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as SMS from "expo-sms";
// import * as FileSystem from "expo-file-system/legacy";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { db } from "../firebaseConfig";
// import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
// import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
// import { RouteProp } from "@react-navigation/native";
// import * as Notifications from "expo-notifications";

// type AddCustomerRouteProp = RouteProp<RootStackParamList, "AddCustomer">;
// type AddCustomerNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   "AddCustomer"
// >;

// type Props = {
//   navigation: AddCustomerNavigationProp;
//   route: AddCustomerRouteProp;
// };

// type NotificationMethod = 'sms' | 'whatsapp' | 'both';


// const storeReminder = async (
//   customerId: string,
//   customerName: string,
//   phone: string,
//   date: Date,
//   notificationMethod: NotificationMethod,
//   customMessage?: string,
//   notificationId?: string
// ) => {
//   try {
//     const reminders = await AsyncStorage.getItem('customerReminders');
//     const remindersArray = reminders ? JSON.parse(reminders) : [];

//     const filteredReminders = remindersArray.filter((reminder: any) => reminder.id !== customerId);

//     filteredReminders.push({
//       id: customerId,
//       name: customerName,
//       phone: phone,
//       date: date.toISOString(),
//       notificationMethod: notificationMethod,
//       customMessage: customMessage || `Hi ${customerName}, this is a friendly reminder from our business. Hope you're doing well!`,
//       created: new Date().toISOString(),
//       sent: false,
//       notificationId: notificationId || null,
//     });

//     await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
//   } catch (error) {
//     console.error('Failed to store reminder:', error);
//   }
// };

// const removeReminder = async (customerId: string) => {
//   try {
//     const reminders = await AsyncStorage.getItem('customerReminders');
//     if (reminders) {
//       const remindersArray = JSON.parse(reminders);
//       const reminder = remindersArray.find((r: any) => r.id === customerId);

//       // Cancel scheduled notification if exists
//       if (reminder?.notificationId) {
//         await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
//         console.log("✅ Cancelled scheduled notification:", reminder.notificationId);
//       }

//       const filteredReminders = remindersArray.filter((r: any) => r.id !== customerId);
//       await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
//     }
//   } catch (error) {
//     console.error('Failed to remove reminder:', error);
//   }
// };


// const sendSMSReminder = async (phone: string, message: string, customerName: string) => {
//   try {
//     const isAvailable = await SMS.isAvailableAsync();
//     if (!isAvailable) {
//       Alert.alert('SMS Not Available', 'SMS functionality is not available on this device');
//       return false;
//     }

//     const { result } = await SMS.sendSMSAsync([phone], message);

//     if (result === 'sent') {
//       console.log(`SMS sent successfully to ${customerName} (${phone})`);
//       return true;
//     } else {
//       console.log(`SMS failed to send to ${customerName}: ${result}`);
//       return false;
//     }
//   } catch (error) {
//     console.error('SMS sending error:', error);
//     Alert.alert('SMS Error', 'Failed to send SMS. Please try again.');
//     return false;
//   }
// };

// const sendWhatsAppReminder = async (phone: string, message: string, customerName: string) => {
//   try {
//     const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
//     const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) :
//       cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

//     const encodedMessage = encodeURIComponent(message);
//     const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;

//     const supported = await Linking.canOpenURL(whatsappUrl);

//     if (supported) {
//       await Linking.openURL(whatsappUrl);
//       console.log(`WhatsApp opened for ${customerName} (${phone})`);
//       return true;
//     } else {
//       Alert.alert(
//         'WhatsApp Not Available',
//         'WhatsApp is not installed on this device',
//         [
//           {
//             text: 'Install WhatsApp',
//             onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.whatsapp')
//           },
//           { text: 'Cancel', style: 'cancel' }
//         ]
//       );
//       return false;
//     }
//   } catch (error) {
//     console.error('WhatsApp sending error:', error);
//     Alert.alert('WhatsApp Error', 'Failed to open WhatsApp. Please try again.');
//     return false;
//   }
// };

// export default function AddCustomerScreen({ navigation, route }: Props) {
//   const { customerToEdit } = route.params || {};
//   const isEditing = !!customerToEdit;

//   const [name, setName] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [address, setAddress] = useState<string>("");
//   const [photo, setPhoto] = useState<string | undefined>(undefined);
//   const [notifyDate, setNotifyDate] = useState<Date | null>(null);
//   const [notificationMethod, setNotificationMethod] = useState<NotificationMethod>('sms');
//   const [customMessage, setCustomMessage] = useState<string>("");
//   const [saving, setSaving] = useState<boolean>(false);
//   const [processingPhoto, setProcessingPhoto] = useState<boolean>(false);
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

//   useEffect(() => {
//     if (customerToEdit) {
//       setName(customerToEdit.name || "");
//       setPhone(customerToEdit.phone || "");
//       setAddress(customerToEdit.address || "");
//       setPhoto(customerToEdit.photoBase64 || customerToEdit.photoURL || customerToEdit.photo);
//       // setNotificationMethod(customerToEdit.notificationMethod || 'sms');
//       setCustomMessage(customerToEdit.customMessage || "");
//       if (customerToEdit.notifyDate) {
//         setNotifyDate(new Date(customerToEdit.notifyDate));
//       }
//     }
//   }, [customerToEdit]);

//   useEffect(() => {
//     (async () => {
//       const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
//       if (camStatus !== "granted") {
//         Alert.alert("Permission Required", "Camera permission is recommended to take photos.");
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (name.trim() && !customMessage.trim() && !isEditing) {
//       setCustomMessage(`Hi ${name.trim()}, this is a friendly reminder about your water purifier service. Hope you're doing well!`);
//     }
//   }, [name, isEditing]);

//   const convertToBase64 = async (uri: string): Promise<string> => {
//     try {
//       setProcessingPhoto(true);
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: "base64",
//       });
//       return `data:image/jpeg;base64,${base64}`;
//     } catch (error) {
//       console.error("Error converting to base64:", error);
//       throw new Error("Failed to process image");
//     } finally {
//       setProcessingPhoto(false);
//     }
//   };

//   const takePhoto = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.5,
//       aspect: [4, 3],
//     });

//     if (!result.canceled && result.assets?.length) {
//       const base64Photo = await convertToBase64(result.assets[0].uri);
//       setPhoto(base64Photo);
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
//       quality: 0.5,
//       aspect: [4, 3],
//     });

//     if (!result.canceled && result.assets?.length) {
//       const base64Photo = await convertToBase64(result.assets[0].uri);
//       setPhoto(base64Photo);
//     }
//   };

//   const showPhotoOptions = () => {
//     Alert.alert(
//       "Water Purifier Photo",
//       "Choose how you'd like to add a photo",
//       [
//         { text: "Cancel", style: "cancel" },
//         { text: "Take Photo", onPress: takePhoto },
//         { text: "Choose from Gallery", onPress: selectFromGallery },
//         ...(photo ? [{ text: "Remove Photo", onPress: () => setPhoto(undefined), style: "destructive" as const }] : [])
//       ]
//     );
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

//     const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       Alert.alert("Validation Error", "Please enter a valid phone number");
//       return false;
//     }

//     if (notifyDate && notifyDate <= new Date()) {
//       Alert.alert("Validation Error", "Reminder date must be in the future");
//       return false;
//     }

//     if (notifyDate && !customMessage.trim()) {
//       Alert.alert("Validation Error", "Please enter a reminder message");
//       return false;
//     }

//     return true;
//   };

//   const testNotification = async () => {
//     if (!phone.trim()) {
//       Alert.alert("Error", "Please enter a phone number first");
//       return;
//     }

//     const message = customMessage.trim() || `Hi ${name.trim() || 'there'}, this is a test message from our business!`;

//     Alert.alert(
//       "Test Notification",
//       "Choose how to send the test message:",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "SMS",
//           onPress: async () => {
//             await sendSMSReminder(phone.trim(), message, name.trim() || "Customer");
//           }
//         },
//         {
//           text: "WhatsApp",
//           onPress: async () => {
//             await sendWhatsAppReminder(phone.trim(), message, name.trim() || "Customer");
//           }
//         }
//       ]
//     );
//   };

//   const handleSave = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setSaving(true);
//     try {
//       const customerData = {
//         name: name.trim(),
//         phone: phone.trim(),
//         address: address.trim(),
//         photoBase64: photo || null,
//         notifyDate: notifyDate ? notifyDate.toISOString() : null,
//         notificationMethod: notificationMethod,
//         customMessage: customMessage.trim(),
//         updatedAt: serverTimestamp(),
//         ...(isEditing ? {} : { createdAt: serverTimestamp() })
//       };

//       let customerId: string;

//       if (isEditing && customerToEdit?.id) {
//         const customerRef = doc(db, "customers", customerToEdit.id);
//         await updateDoc(customerRef, customerData);
//         customerId = customerToEdit.id;
//         console.log("Updated customer id:", customerId);
//       } else {
//         const docRef = await addDoc(collection(db, "customers"), customerData);
//         customerId = docRef.id;
//         console.log("Created new customer id:", customerId);
//       }

//       if (notifyDate) {
//         const notificationId = await scheduleReminder(notifyDate, customMessage.trim());

//         await storeReminder(
//           customerId,
//           name.trim(),
//           phone.trim(),
//           notifyDate,
//           notificationMethod,
//           customMessage.trim(),
//           notificationId 
//         );
//       } else {
//         await removeReminder(customerId);
//       }

//       const methodText = notificationMethod === 'both' ? 'SMS & WhatsApp' :
//         notificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS';

//       const actionText = isEditing ? "updated" : "added";
//       const successMessage = notifyDate
//         ? `Customer ${actionText} successfully! Reminder set for ${notifyDate.toLocaleDateString()} at ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} via ${methodText}.`
//         : `Customer ${actionText} successfully!`;

//       Alert.alert("Success", successMessage, [
//         { text: "OK", onPress: () => navigation.goBack() }
//       ]);
//     } catch (err: any) {
//       console.error("handleSave error:", err);
//       const actionText = isEditing ? "update" : "save";
//       const errorMessage = err.message || `Failed to ${actionText} customer. Please check your internet connection and try again.`;
//       Alert.alert("Error", errorMessage);
//     } finally {
//       setSaving(false);
//     }
//   };

// const scheduleReminder = async (notifyDate: Date, customMessage: string): Promise<string> => {
//   try {
//     let scheduledDate = new Date(notifyDate);

//     // If the picked time is in the past, move to next day
//     if (scheduledDate <= new Date()) {
//       scheduledDate.setDate(scheduledDate.getDate() + 1);
//     }

//     const notificationId = await Notifications.scheduleNotificationAsync({
//       content: {
//         title: "⏰ Reminder",
//         body: customMessage || "You have a reminder!",
//         sound: true,
//         priority: Notifications.AndroidNotificationPriority.HIGH,
//       },
//       trigger: {
//         type: Notifications.SchedulableTriggerInputTypes.DATE,
//         date: scheduledDate,
//       },
//     });

//     console.log("✅ Reminder scheduled for:", scheduledDate, "with ID:", notificationId);
//     return notificationId;
//   } catch (error) {
//     console.error("❌ Error scheduling reminder:", error);
//     throw error;
//   }
// };

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
//           <Text style={styles.headerTitle}>
//             {isEditing ? "✏️ Edit Customer" : "➕ Add New Customer"}
//           </Text>
//           <Text style={styles.headerSubtitle}>
//             {isEditing ? "Update customer details" : "Fill in the customer details"}
//           </Text>
//         </View>

//         <View style={styles.formContainer}>
//           {/* Water Purifier Photo Section */}
//           <View style={styles.photoSection}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>💧 Water Purifier Photo</Text>
//               <Text style={styles.optionalBadge}>Optional</Text>
//             </View>
//             <Text style={styles.sectionDescription}>
//               Add a photo of the water purifier for reference
//             </Text>

//             <View style={styles.photoContainer}>
//               {photo ? (
//                 <View style={styles.photoWrapper}>
//                   <Image source={{ uri: photo }} style={styles.purifierPhoto} />
//                   <View style={styles.photoOverlay}>
//                     <TouchableOpacity
//                       style={styles.photoActionButton}
//                       onPress={showPhotoOptions}
//                     >
//                       <Text style={styles.photoActionText}>Change Photo</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.addPhotoContainer}
//                   onPress={showPhotoOptions}
//                   disabled={processingPhoto}
//                 >
//                   {processingPhoto ? (
//                     <ActivityIndicator color="#007bff" size="large" />
//                   ) : (
//                     <>
//                       <View style={styles.addPhotoIconContainer}>
//                         <Text style={styles.addPhotoIcon}>📷</Text>
//                       </View>
//                       <Text style={styles.addPhotoTitle}>Add Photo</Text>
//                       <Text style={styles.addPhotoSubtitle}>
//                         Take a photo or choose from gallery
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           {/* Customer Details Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>👤 Customer Details</Text>
//               <Text style={styles.requiredBadge}>Required</Text>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>
//                 Full Name <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 placeholder="Enter customer's full name"
//                 style={styles.input}
//                 value={name}
//                 onChangeText={setName}
//                 placeholderTextColor="#999"
//                 autoCapitalize="words"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>
//                 Phone Number <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 placeholder="+91 XXXXX XXXXX"
//                 style={styles.input}
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#999"
//                 autoComplete="tel"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>
//                 Address <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 placeholder="Enter full address with landmark"
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

//           {/* Reminder Settings Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>🔔 Reminder Settings</Text>
//               <Text style={styles.optionalBadge}>Optional</Text>
//             </View>
//             <Text style={styles.sectionDescription}>
//               Set automatic reminders for service follow-ups
//             </Text>

//             <View style={styles.methodSelection}>
//               <Text style={styles.methodLabel}>Notification Method</Text>
//               <View style={styles.methodButtons}>
//                 <TouchableOpacity
//                   style={[styles.methodButton, notificationMethod === 'sms' && styles.methodButtonActive]}
//                   onPress={() => setNotificationMethod('sms')}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.methodIcon}>💬</Text>
//                   <Text style={[styles.methodButtonText, notificationMethod === 'sms' && styles.methodButtonTextActive]}>
//                     SMS
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.methodButton, notificationMethod === 'whatsapp' && styles.methodButtonActive]}
//                   onPress={() => setNotificationMethod('whatsapp')}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.methodIcon}>📱</Text>
//                   <Text style={[styles.methodButtonText, notificationMethod === 'whatsapp' && styles.methodButtonTextActive]}>
//                     WhatsApp
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[styles.methodButton, notificationMethod === 'both' && styles.methodButtonActive]}
//                   onPress={() => setNotificationMethod('both')}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={styles.methodIcon}>📲</Text>
//                   <Text style={[styles.methodButtonText, notificationMethod === 'both' && styles.methodButtonTextActive]}>
//                     Both
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.dateTimeRow}>
//               <TouchableOpacity
//                 style={styles.dateTimeButton}
//                 onPress={() => setShowDatePicker(true)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.dateTimeIcon}>📅</Text>
//                 <View style={styles.dateTimeContent}>
//                   <Text style={styles.dateTimeLabel}>Date</Text>
//                   <Text style={styles.dateTimeValue}>
//                     {notifyDate ? notifyDate.toLocaleDateString() : "Select date"}
//                   </Text>
//                 </View>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dateTimeButton}
//                 onPress={() => setShowTimePicker(true)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.dateTimeIcon}>⏰</Text>
//                 <View style={styles.dateTimeContent}>
//                   <Text style={styles.dateTimeLabel}>Time</Text>
//                   <Text style={styles.dateTimeValue}>
//                     {notifyDate ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Select time"}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Custom Message</Text>
//               <TextInput
//                 placeholder="Enter your reminder message..."
//                 style={[styles.input, styles.textArea]}
//                 value={customMessage}
//                 onChangeText={setCustomMessage}
//                 multiline={true}
//                 numberOfLines={4}
//                 placeholderTextColor="#999"
//                 textAlignVertical="top"
//               />
//             </View>

//             {phone.trim() && customMessage.trim() && (
//               <TouchableOpacity
//                 style={styles.testButton}
//                 onPress={testNotification}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.testButtonIcon}>🧪</Text>
//                 <Text style={styles.testButtonText}>Test Notification</Text>
//               </TouchableOpacity>
//             )}

//             {notifyDate && (
//               <View style={styles.reminderPreview}>
//                 <View style={styles.reminderPreviewHeader}>
//                   <Text style={styles.reminderPreviewTitle}>✓ Reminder Scheduled</Text>
//                   <TouchableOpacity
//                     onPress={() => setNotifyDate(null)}
//                     style={styles.clearButton}
//                   >
//                     <Text style={styles.clearButtonText}>✕</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={styles.reminderPreviewDate}>
//                   {notifyDate.toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                   })}
//                 </Text>
//                 <Text style={styles.reminderPreviewTime}>
//                   at {notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                 </Text>
//                 <View style={styles.reminderMethodBadge}>
//                   <Text style={styles.reminderMethodText}>
//                     via {notificationMethod === 'both' ? 'SMS & WhatsApp' :
//                       notificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {showDatePicker && (
//               <DateTimePicker
//                 value={notifyDate || new Date()}
//                 mode="date"
//                 display={Platform.OS === "ios" ? "inline" : "default"}
//                 minimumDate={new Date()}
//                 onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
//                   setShowDatePicker(false);
//                   if (event.type === "set" && selectedDate) {
//                     const newDate = new Date(selectedDate);
//                     if (notifyDate) {
//                       newDate.setHours(notifyDate.getHours(), notifyDate.getMinutes());
//                     } else {
//                       const now = new Date();
//                       newDate.setHours(now.getHours(), now.getMinutes());
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
//                     const newDate = notifyDate ? new Date(notifyDate) : new Date();
//                     newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
//                     setNotifyDate(newDate);
//                   }
//                 }}
//               />
//             )}
//           </View>
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={styles.cancelButton}
//             onPress={() => navigation.goBack()}
//             disabled={saving}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.cancelButtonText}>Cancel</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//             onPress={handleSave}
//             disabled={saving}
//             activeOpacity={0.8}
//           >
//             {saving ? (
//               <View style={styles.savingContainer}>
//                 <ActivityIndicator color="#fff" size="small" />
//                 <Text style={styles.savingText}>Saving...</Text>
//               </View>
//             ) : (
//               <Text style={styles.saveButtonText}>
//                 {isEditing ? "💾 Update Customer" : "✓ Save Customer"}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f7fa",
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 30,
//   },
//   header: {
//     backgroundColor: "#fff",
//     padding: 24,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e8ecef",
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 15,
//     color: "#6c757d",
//   },
//   formContainer: {
//     padding: 16,
//   },
//   section: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1a1a1a",
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: "#6c757d",
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   optionalBadge: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#6c757d",
//     backgroundColor: "#e9ecef",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   requiredBadge: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#fff",
//     backgroundColor: "#dc3545",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   photoSection: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   photoContainer: {
//     alignItems: "center",
//   },
//   photoWrapper: {
//     position: "relative",
//     width: "100%",
//     aspectRatio: 4 / 3,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   purifierPhoto: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#f0f0f0",
//   },
//   photoOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     padding: 12,
//     alignItems: "center",
//   },
//   photoActionButton: {
//     paddingVertical: 6,
//   },
//   photoActionText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   addPhotoContainer: {
//     width: "100%",
//     aspectRatio: 4 / 3,
//     borderRadius: 12,
//     backgroundColor: "#f8f9fa",
//     borderWidth: 2,
//     borderColor: "#dee2e6",
//     borderStyle: "dashed",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   addPhotoIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#e7f3ff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   addPhotoIcon: {
//     fontSize: 32,
//   },
//   addPhotoTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1a1a1a",
//     marginBottom: 4,
//   },
//   addPhotoSubtitle: {
//     fontSize: 13,
//     color: "#6c757d",
//     textAlign: "center",
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 8,
//   },
//   required: {
//     color: "#dc3545",
//     fontWeight: "bold",
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: "#dee2e6",
//     padding: 14,
//     borderRadius: 10,
//     fontSize: 15,
//     backgroundColor: "#fff",
//     color: "#212529",
//   },
//   textArea: {
//     minHeight: 100,
//     maxHeight: 150,
//     paddingTop: 14,
//   },
//   methodSelection: {
//     marginBottom: 20,
//   },
//   methodLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 12,
//   },
//   methodButtons: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   methodButton: {
//     flex: 1,
//     flexDirection: "column",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#dee2e6",
//     backgroundColor: "#f8f9fa",
//   },
//   methodButtonActive: {
//     borderColor: "#007bff",
//     backgroundColor: "#e7f3ff",
//   },
//   methodIcon: {
//     fontSize: 24,
//     marginBottom: 6,
//   },
//   methodButtonText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#6c757d",
//   },
//   methodButtonTextActive: {
//     color: "#007bff",
//   },
//   dateTimeRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 20,
//   },
//   dateTimeButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//     padding: 14,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: "#dee2e6",
//   },
//   dateTimeIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   dateTimeContent: {
//     flex: 1,
//   },
//   dateTimeLabel: {
//     fontSize: 12,
//     color: "#6c757d",
//     marginBottom: 2,
//   },
//   dateTimeValue: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#212529",
//   },
//   testButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#17a2b8",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 12,
//     shadowColor: "#17a2b8",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   testButtonIcon: {
//     fontSize: 18,
//     marginRight: 8,
//   },
//   testButtonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   reminderPreview: {
//     backgroundColor: "#d4edda",
//     padding: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#c3e6cb",
//     marginTop: 16,
//   },
//   reminderPreviewHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   reminderPreviewTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#155724",
//   },
//   clearButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "#155724",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   clearButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   reminderPreviewDate: {
//     fontSize: 15,
//     color: "#155724",
//     fontWeight: "600",
//     marginBottom: 2,
//   },
//   reminderPreviewTime: {
//     fontSize: 14,
//     color: "#155724",
//     marginBottom: 8,
//   },
//   reminderMethodBadge: {
//     alignSelf: "flex-start",
//     backgroundColor: "#155724",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   reminderMethodText: {
//     fontSize: 12,
//     color: "#fff",
//     fontWeight: "600",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     paddingHorizontal: 16,
//     gap: 12,
//     marginTop: 8,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#dee2e6",
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cancelButtonText: {
//     color: "#6c757d",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   saveButton: {
//     flex: 1,
//     backgroundColor: "#28a745",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#28a745",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   saveButtonDisabled: {
//     backgroundColor: "#94d3a2",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   savingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   savingText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

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
import * as Notifications from "expo-notifications";
import { t } from "./translations"; // Import the translation helper

type AddCustomerRouteProp = RouteProp<RootStackParamList, "AddCustomer">;
type AddCustomerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddCustomer"
>;

type Props = {
  navigation: AddCustomerNavigationProp;
  route: AddCustomerRouteProp;
};

type MessageType = 'default' | 'custom';

const BUSINESS_PHONE = "9373332947";
const LANGUAGE = 'en'; // Change to 'en' for English

const storeReminder = async (
  customerId: string,
  customerName: string,
  phone: string,
  date: Date,
  messageType: MessageType,
  customMessage?: string,
  notificationId?: string
) => {
  try {
    const reminders = await AsyncStorage.getItem('customerReminders');
    const remindersArray = reminders ? JSON.parse(reminders) : [];

    const filteredReminders = remindersArray.filter((reminder: any) => reminder.id !== customerId);

    const defaultMsg = t('defaultSMSTemplate', LANGUAGE, customerName, BUSINESS_PHONE);

    filteredReminders.push({
      id: customerId,
      name: customerName,
      phone: phone,
      date: date.toISOString(),
      messageType: messageType,
      customMessage: messageType === 'custom' ? customMessage : defaultMsg,
      created: new Date().toISOString(),
      sent: false,
      notificationId: notificationId || null,
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
      const reminder = remindersArray.find((r: any) => r.id === customerId);

      if (reminder?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        console.log("✅ Cancelled scheduled notification:", reminder.notificationId);
      }

      const filteredReminders = remindersArray.filter((r: any) => r.id !== customerId);
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
      Alert.alert(t('smsNotAvailable', LANGUAGE), t('smsNotAvailableMessage', LANGUAGE));
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
    Alert.alert(t('smsError', LANGUAGE), t('smsErrorMessage', LANGUAGE));
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
  const [messageType, setMessageType] = useState<MessageType>('default');
  const [customMessage, setCustomMessage] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [processingPhoto, setProcessingPhoto] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const getDefaultMessage = () => {
    const customerName = name.trim() || (LANGUAGE === 'en' ? "ग्राहक" : "Customer");
    return t('defaultSMSTemplate', LANGUAGE, customerName, BUSINESS_PHONE);
  };

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || "");
      setPhone(customerToEdit.phone || "");
      setAddress(customerToEdit.address || "");
      setPhoto(customerToEdit.photoBase64 || customerToEdit.photoURL || customerToEdit.photo);
      
      const savedMessageType = customerToEdit.messageType;
      if (savedMessageType === 'default' || savedMessageType === 'custom') {
        setMessageType(savedMessageType);
      } else {
        setMessageType('default');
      }
      
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
        Alert.alert(t('permissionRequired', LANGUAGE), t('cameraPermissionMessage', LANGUAGE));
      }
    })();
  }, []);

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
      Alert.alert(t('permissionRequired', LANGUAGE), t('galleryPermissionMessage', LANGUAGE));
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
      t('waterPurifierPhotoTitle', LANGUAGE),
      t('choosePhotoMethod', LANGUAGE),
      [
        { text: t('cancel', LANGUAGE), style: "cancel" },
        { text: t('takePhoto', LANGUAGE), onPress: takePhoto },
        { text: t('chooseFromGallery', LANGUAGE), onPress: selectFromGallery },
        ...(photo ? [{ text: t('removePhoto', LANGUAGE), onPress: () => setPhoto(undefined), style: "destructive" as const }] : [])
      ]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(t('validationError', LANGUAGE), t('enterCustomerName', LANGUAGE));
      return false;
    }
    if (!phone.trim()) {
      Alert.alert(t('validationError', LANGUAGE), t('enterPhoneNumber', LANGUAGE));
      return false;
    }
    if (!address.trim()) {
      Alert.alert(t('validationError', LANGUAGE), t('enterAddress', LANGUAGE));
      return false;
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert(t('validationError', LANGUAGE), t('enterValidPhone', LANGUAGE));
      return false;
    }

    if (notifyDate && notifyDate <= new Date()) {
      Alert.alert(t('validationError', LANGUAGE), t('reminderDateFuture', LANGUAGE));
      return false;
    }

    if (notifyDate && messageType === 'custom' && !customMessage.trim()) {
      Alert.alert(t('validationError', LANGUAGE), t('enterCustomMessageError', LANGUAGE));
      return false;
    }

    return true;
  };

  const testNotification = async () => {
    if (!phone.trim()) {
      Alert.alert(t('error', LANGUAGE), t('enterPhoneFirst', LANGUAGE));
      return;
    }

    const message = messageType === 'custom' && customMessage.trim() 
      ? customMessage.trim() 
      : getDefaultMessage();

    await sendSMSReminder(phone.trim(), message, name.trim() || (LANGUAGE === 'en' ? "ग्राहक" : "Customer"));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const messageToSave = messageType === 'custom' ? customMessage.trim() : getDefaultMessage();

      const customerData = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        photoBase64: photo || null,
        notifyDate: notifyDate ? notifyDate.toISOString() : null,
        messageType: messageType,
        customMessage: messageToSave,
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
        const notificationId = await scheduleReminder(notifyDate, messageToSave);

        await storeReminder(
          customerId,
          name.trim(),
          phone.trim(),
          notifyDate,
          messageType,
          messageToSave,
          notificationId 
        );
      } else {
        await removeReminder(customerId);
      }

      const successMessage = notifyDate
        ? (isEditing 
            ? t('customerUpdatedSuccess', LANGUAGE, notifyDate.toLocaleDateString(), notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
            : t('customerAddedSuccess', LANGUAGE, notifyDate.toLocaleDateString(), notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })))
        : (isEditing ? t('customerUpdatedSimple', LANGUAGE) : t('customerAddedSimple', LANGUAGE));

      Alert.alert(t('success', LANGUAGE), successMessage, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error("handleSave error:", err);
      const errorMessage = err.message || (isEditing ? t('updateError', LANGUAGE) : t('saveError', LANGUAGE));
      Alert.alert(t('error', LANGUAGE), errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const scheduleReminder = async (notifyDate: Date, message: string): Promise<string> => {
    try {
      let scheduledDate = new Date(notifyDate);

      if (scheduledDate <= new Date()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: LANGUAGE === 'en' ? "⏰ सर्व्हिस स्मरणपत्र" : "⏰ Service Reminder",
          body: message,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
        },
      });

      console.log("✅ Reminder scheduled for:", scheduledDate, "with ID:", notificationId);
      return notificationId;
    } catch (error) {
      console.error("❌ Error scheduling reminder:", error);
      throw error;
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
            {isEditing ? t('editCustomer', LANGUAGE) : t('addNewCustomer', LANGUAGE)}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? t('updateCustomerDetails', LANGUAGE) : t('fillCustomerDetails', LANGUAGE)}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Water Purifier Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('waterPurifierPhoto', LANGUAGE)}</Text>
              <Text style={styles.optionalBadge}>{t('optional', LANGUAGE)}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t('addPhotoDescription', LANGUAGE)}
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
                      <Text style={styles.photoActionText}>{t('changePhoto', LANGUAGE)}</Text>
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
                      <Text style={styles.addPhotoTitle}>{t('addPhoto', LANGUAGE)}</Text>
                      <Text style={styles.addPhotoSubtitle}>
                        {t('takePhotoOrChoose', LANGUAGE)}
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
              <Text style={styles.sectionTitle}>{t('customerDetails', LANGUAGE)}</Text>
              <Text style={styles.requiredBadge}>{t('required', LANGUAGE)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('fullName', LANGUAGE)} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder={t('enterFullName', LANGUAGE)}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t('phoneNumber', LANGUAGE)} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder={t('phonePlaceholder', LANGUAGE)}
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
                {t('address', LANGUAGE)} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder={t('enterAddress', LANGUAGE)}
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

          {/* SMS Reminder Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('smsReminderSettings', LANGUAGE)}</Text>
              <Text style={styles.optionalBadge}>{t('optional', LANGUAGE)}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t('smsReminderDescription', LANGUAGE)}
            </Text>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>{t('date', LANGUAGE)}</Text>
                  <Text style={styles.dateTimeValue}>
                    {notifyDate ? notifyDate.toLocaleDateString() : t('selectDate', LANGUAGE)}
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
                  <Text style={styles.dateTimeLabel}>{t('time', LANGUAGE)}</Text>
                  <Text style={styles.dateTimeValue}>
                    {notifyDate ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t('selectTime', LANGUAGE)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Message Type Selection */}
            <View style={styles.messageTypeSelection}>
              <Text style={styles.messageTypeLabel}>{t('messageType', LANGUAGE)}</Text>
              
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMessageType('default')}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {messageType === 'default' && <View style={styles.radioButtonSelected} />}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{t('defaultMessage', LANGUAGE)}</Text>
                  <Text style={styles.radioDescription}>
                    {getDefaultMessage()}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMessageType('custom')}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {messageType === 'custom' && <View style={styles.radioButtonSelected} />}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{t('customMessage', LANGUAGE)}</Text>
                  <Text style={styles.radioDescription}>{t('writeOwnMessage', LANGUAGE)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {messageType === 'custom' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('customMessageLabel', LANGUAGE)}</Text>
                <TextInput
                  placeholder={t('enterCustomMessage', LANGUAGE)}
                  style={[styles.input, styles.textArea]}
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  multiline={true}
                  numberOfLines={4}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </View>
            )}

            {phone.trim() && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={testNotification}
                activeOpacity={0.8}
              >
                <Text style={styles.testButtonIcon}>📤</Text>
                <Text style={styles.testButtonText}>{t('testSMS', LANGUAGE)}</Text>
              </TouchableOpacity>
            )}

            {notifyDate && (
              <View style={styles.reminderPreview}>
                <View style={styles.reminderPreviewHeader}>
                  <Text style={styles.reminderPreviewTitle}>{t('smsReminderScheduled', LANGUAGE)}</Text>
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
                  {t('at', LANGUAGE)} {notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <View style={styles.reminderMethodBadge}>
                  <Text style={styles.reminderMethodText}>{t('viaSMS', LANGUAGE)} {BUSINESS_PHONE}</Text>
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
      </ScrollView>

      {/* Fixed Action Buttons at Bottom */}
      <View style={styles.actionButtonsContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{t('cancelButton', LANGUAGE)}</Text>
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
                <Text style={styles.savingText}>{t('saving', LANGUAGE)}</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? t('updateCustomer', LANGUAGE) : t('saveCustomer', LANGUAGE)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#007bff",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e3f2fd",
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
  },
  optionalBadge: {
    fontSize: 12,
    color: "#6c757d",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredBadge: {
    fontSize: 12,
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoContainer: {
    marginTop: 12,
  },
  photoWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  purifierPhoto: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    alignItems: "center",
  },
  photoActionButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoActionText: {
    color: "#007bff",
    fontWeight: "600",
  },
  addPhotoContainer: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#dee2e6",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  addPhotoIconContainer: {
    marginBottom: 12,
  },
  addPhotoIcon: {
    fontSize: 48,
  },
  addPhotoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 4,
  },
  addPhotoSubtitle: {
    fontSize: 14,
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
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#212529",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
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
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
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
  messageTypeSelection: {
    marginBottom: 20,
  },
  messageTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007bff",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 13,
    color: "#6c757d",
    lineHeight: 18,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  testButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007bff",
  },
  reminderPreview: {
    backgroundColor: "#d1ecf1",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  reminderPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderPreviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0c5460",
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: "#0c5460",
    fontWeight: "bold",
  },
  reminderPreviewDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0c5460",
    marginBottom: 4,
  },
  reminderPreviewTime: {
    fontSize: 14,
    color: "#0c5460",
    marginBottom: 8,
  },
  reminderMethodBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  reminderMethodText: {
    fontSize: 12,
    color: "#0c5460",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6c757d",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom:18
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom:18
  },
  saveButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f7fa",
//   },
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 100, // Space for fixed buttons
//   },
//   header: {
//     backgroundColor: "#fff",
//     padding: 24,
//     paddingTop: Platform.OS === 'ios' ? 60 : 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e8ecef",
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 15,
//     color: "#6c757d",
//   },
//   formContainer: {
//     padding: 16,
//   },
//   section: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1a1a1a",
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: "#6c757d",
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   optionalBadge: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#6c757d",
//     backgroundColor: "#e9ecef",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   requiredBadge: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#fff",
//     backgroundColor: "#dc3545",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   photoSection: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 3,
//   },
//   photoContainer: {
//     alignItems: "center",
//   },
//   photoWrapper: {
//     position: "relative",
//     width: "100%",
//     aspectRatio: 4 / 3,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   purifierPhoto: {
//     width: "100%",
//     height: "100%",
//     backgroundColor: "#f0f0f0",
//   },
//   photoOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     padding: 12,
//     alignItems: "center",
//   },
//   photoActionButton: {
//     paddingVertical: 6,
//   },
//   photoActionText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   addPhotoContainer: {
//     width: "100%",
//     aspectRatio: 4 / 3,
//     borderRadius: 12,
//     backgroundColor: "#f8f9fa",
//     borderWidth: 2,
//     borderColor: "#dee2e6",
//     borderStyle: "dashed",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   addPhotoIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#e7f3ff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   addPhotoIcon: {
//     fontSize: 32,
//   },
//   addPhotoTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1a1a1a",
//     marginBottom: 4,
//   },
//   addPhotoSubtitle: {
//     fontSize: 13,
//     color: "#6c757d",
//     textAlign: "center",
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 8,
//   },
//   required: {
//     color: "#dc3545",
//     fontWeight: "bold",
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: "#dee2e6",
//     padding: 14,
//     borderRadius: 10,
//     fontSize: 15,
//     backgroundColor: "#fff",
//     color: "#212529",
//   },
//   textArea: {
//     minHeight: 100,
//     maxHeight: 150,
//     paddingTop: 14,
//   },
//   dateTimeRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 20,
//   },
//   dateTimeButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//     padding: 14,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: "#dee2e6",
//   },
//   dateTimeIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   dateTimeContent: {
//     flex: 1,
//   },
//   dateTimeLabel: {
//     fontSize: 12,
//     color: "#6c757d",
//     marginBottom: 2,
//   },
//   dateTimeValue: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#212529",
//   },
//   messageTypeSelection: {
//     marginBottom: 20,
//   },
//   messageTypeLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 12,
//   },
//   radioOption: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     padding: 16,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: "#dee2e6",
//     marginBottom: 12,
//   },
//   radioButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//     marginTop: 2,
//   },
//   radioButtonSelected: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#007bff",
//   },
//   radioContent: {
//     flex: 1,
//   },
//   radioLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#212529",
//     marginBottom: 4,
//   },
//   radioDescription: {
//     fontSize: 13,
//     color: "#6c757d",
//     lineHeight: 18,
//   },
//   testButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#17a2b8",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 12,
//     shadowColor: "#17a2b8",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   testButtonIcon: {
//     fontSize: 18,
//     marginRight: 8,
//   },
//   testButtonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   reminderPreview: {
//     backgroundColor: "#d4edda",
//     padding: 16,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#c3e6cb",
//     marginTop: 16,
//   },
//   reminderPreviewHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   reminderPreviewTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#155724",
//   },
//   clearButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "#155724",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   clearButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   reminderPreviewDate: {
//     fontSize: 15,
//     color: "#155724",
//     fontWeight: "600",
//     marginBottom: 2,
//   },
//   reminderPreviewTime: {
//     fontSize: 14,
//     color: "#155724",
//     marginBottom: 8,
//   },
//   reminderMethodBadge: {
//     alignSelf: "flex-start",
//     backgroundColor: "#155724",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   reminderMethodText: {
//     fontSize: 12,
//     color: "#fff",
//     fontWeight: "600",
//   },
//   actionButtonsContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#fff",
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//     paddingHorizontal: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#e8ecef",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#dee2e6",
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//       marginBottom:17
//   },
//   cancelButtonText: {
//     color: "#6c757d",
//     fontSize: 16,
//     fontWeight: "600",  
  
//   },
//   saveButton: {
//     flex: 1,
//     backgroundColor: "#28a745",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#28a745",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//     marginBottom:17
//   },
//   saveButtonDisabled: {
//     backgroundColor: "#94d3a2",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   saveButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   savingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   savingText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });